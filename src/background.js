/**
 * @file Service worker entry point.
 *
 * Routes messages from the popup and options pages to lib/actions.js and lib/refresh.js,
 * keeps the refresh alarm scheduled, and refreshes on startup, install/update, wake from
 * idle, settings changes and newly granted permissions. All listeners are registered
 * synchronously at top level, as Manifest V3 requires.
 */
import { addWatch, markAllViewed, openWatch, recheckAll, testConnection } from './lib/actions.js';
import { clearWatchCache, readWatchCache } from './lib/cache.js';
import { createLogger } from './lib/log.js';
import { ACTIONS } from './lib/messages.js';
import { notificationClickTarget } from './lib/notify.js';
import { refreshWatches } from './lib/refresh.js';
import { REFRESH_ALARM, clearLegacyAlarms, ensureRefreshAlarm } from './lib/scheduler.js';
import { loadSettings } from './lib/settings.js';

const log = createLogger('background');

/**
 * Run the operation named by a message.
 *
 * @param {{action: string}} request - Message from a page; see lib/messages.js.
 * @returns {Promise<*>} The operation result, undefined when it has none.
 * @throws {Error} For unknown actions and failed operations.
 */
async function runAction(request) {
  switch (request.action) {
    case ACTIONS.GET_WATCHES: {
      const { watches, fetchedAt } = await refreshWatches('popup');
      return { watches, fetchedAt };
    }
    case ACTIONS.OPEN_WATCH:
      return openWatch(request);
    case ACTIONS.MARK_ALL_VIEWED:
      return markAllViewed(request.items ?? []);
    case ACTIONS.TEST_CONNECTION:
      return testConnection(request);
    case ACTIONS.ADD_WATCH:
      return addWatch(request);
    case ACTIONS.RECHECK_ALL:
      return recheckAll();
    default:
      throw new Error(`Unknown action: ${request.action}`);
  }
}

/**
 * Handle one message and wrap the result in the response envelope; never throws.
 *
 * @param {{action: string}} request - Message from a page.
 * @returns {Promise<import('./lib/messages.js').MessageResponse>} `{success: true, data?}` or `{success: false, error, errorKind?}`.
 */
export async function handleMessage(request) {
  try {
    const data = await runAction(request ?? {});
    return data === undefined ? { success: true } : { success: true, data };
  } catch (error) {
    log.warn('Message %s failed: %s', String(request?.action), error.message);
    return { success: false, error: error.message, errorKind: error.kind };
  }
}

/**
 * Refresh and ignore failures (refreshWatches already logged and counted them).
 *
 * @param {string} reason - What triggered the refresh.
 * @returns {Promise<void>} Resolves when the refresh finished or failed.
 */
async function refreshQuietly(reason) {
  try {
    await refreshWatches(reason);
  } catch {
    // Already recorded by refreshWatches.
  }
}

/**
 * Make sure the refresh alarm matches the saved interval.
 *
 * @returns {Promise<void>} Resolves when the alarm is scheduled.
 */
export async function scheduleRefresh() {
  const { refreshInterval } = await loadSettings();
  await ensureRefreshAlarm(refreshInterval);
}

/**
 * chrome.runtime.onInstalled handler: clean up, schedule, onboard, refresh.
 *
 * @param {{reason: string}} details - Install details; reason is 'install', 'update', …
 * @returns {Promise<void>} Resolves when done.
 */
export async function onInstalled({ reason }) {
  log.info('Extension %s: version %s', reason, chrome.runtime.getManifest().version);
  await clearLegacyAlarms();
  await scheduleRefresh();
  if (reason === 'install') await chrome.runtime.openOptionsPage();
  await refreshQuietly(reason);
}

/**
 * chrome.runtime.onStartup handler.
 *
 * @returns {Promise<void>} Resolves when done.
 */
export async function onStartup() {
  await scheduleRefresh();
  await refreshQuietly('startup');
}

/**
 * chrome.alarms.onAlarm handler.
 *
 * @param {{name: string}} alarm - The alarm that fired.
 * @returns {Promise<void>} Resolves when done.
 */
export async function onAlarm(alarm) {
  if (alarm.name === REFRESH_ALARM) await refreshQuietly('alarm');
}

/**
 * chrome.idle.onStateChanged handler: refresh when the user comes back.
 *
 * @param {string} state - 'active', 'idle' or 'locked'.
 * @returns {Promise<void>} Resolves when done.
 */
export async function onIdleStateChanged(state) {
  if (state === 'active') await refreshQuietly('wake');
}

/**
 * chrome.storage.onChanged handler: reschedule and refresh after settings change.
 *
 * @param {object} changes - Changed keys.
 * @param {string} areaName - 'sync', 'local' or 'session'.
 * @returns {Promise<void>} Resolves when done.
 */
export async function onStorageChanged(changes, areaName) {
  if (areaName !== 'sync') return;
  if (changes.refreshInterval) await scheduleRefresh();
  if (changes.baseURL || changes.apiKey) {
    await clearWatchCache();
    await refreshQuietly('settings');
  }
}

/**
 * chrome.notifications.onClicked handler: open the notified watch and mark it viewed (or open
 * the server for the summary notification), then close the notification.
 *
 * @param {string} notificationId - ID of the clicked notification.
 * @returns {Promise<void>} Resolves when done; a failed mark-as-viewed is logged, never thrown.
 */
export async function onNotificationClicked(notificationId) {
  const { baseURL } = await loadSettings();
  if (!baseURL) {
    log.warn('Ignored notification %s: server URL is not set', notificationId);
    return;
  }
  const cache = await readWatchCache();
  const target = notificationClickTarget(notificationId, baseURL, cache?.watches ?? []);
  if (target.uuid) {
    try {
      await openWatch(target);
    } catch (error) {
      log.warn('Could not mark watch %s viewed from notification: %s', target.uuid, error.message);
    }
  } else {
    await chrome.tabs.create({ url: target.url });
  }
  await chrome.notifications.clear(notificationId);
  log.info('Opened notification %s', notificationId);
}

/**
 * Register the notification click handler once chrome.notifications exists
 * (the API appears only after the optional permission is granted).
 */
function registerNotificationListener() {
  if (chrome.notifications && !chrome.notifications.onClicked.hasListener(onNotificationClicked)) {
    chrome.notifications.onClicked.addListener(onNotificationClicked);
  }
}

/**
 * chrome.permissions.onAdded handler.
 *
 * @param {{permissions?: string[], origins?: string[]}} permissions - Newly granted permissions.
 * @returns {Promise<void>} Resolves when done.
 */
export async function onPermissionsAdded(permissions) {
  if (permissions.permissions?.includes('notifications')) registerNotificationListener();
  if (permissions.origins?.length) await refreshQuietly('permission');
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  handleMessage(request).then(sendResponse);
  return true;
});

chrome.runtime.onInstalled.addListener(onInstalled);
chrome.runtime.onStartup.addListener(onStartup);
chrome.alarms.onAlarm.addListener(onAlarm);
chrome.idle.onStateChanged.addListener(onIdleStateChanged);
chrome.storage.onChanged.addListener(onStorageChanged);
chrome.permissions.onAdded.addListener(onPermissionsAdded);
registerNotificationListener();

/**
 * Service-worker start-up: make sure the refresh alarm exists (Chrome may have dropped it).
 *
 * @returns {Promise<void>} Resolves when done; failures are logged, never thrown.
 */
export async function initialize() {
  try {
    await scheduleRefresh();
  } catch (error) {
    log.error('Could not schedule refresh: %s', error.message);
  }
}

export const ready = initialize();
