/**
 * @file The refresh cycle: fetch every watch, then update the failure counter, cache, badge
 * and notifications.
 *
 * Triggered by the alarm, the popup, browser startup, install/update, waking from idle,
 * settings changes and newly granted host permissions. A single failure keeps the previous
 * badge (e.g. network not ready after sleep); from the second consecutive failure the badge
 * shows a grey '!' with the error in its tooltip.
 */
import { ApiError, ChangeDetectionClient } from './api.js';
import { clearBadge, showErrorBadge, showUnreadBadge } from './badge.js';
import { writeWatchCache } from './cache.js';
import { createLogger } from './log.js';
import { notifyNewChanges } from './notify.js';
import { hasHostPermission, isConfigured, loadSettings } from './settings.js';
import { countUnread, normalizeWatchList } from './watches.js';

const log = createLogger('refresh');

export const FAILURE_COUNT_KEY = 'refreshFailureCount';
export const FAILURES_BEFORE_ERROR_BADGE = 2;

/**
 * Outcome of a refresh.
 *
 * @typedef {object} RefreshResult
 * @property {boolean} configured - False when the server URL or API key is missing; nothing was fetched.
 * @property {import('./watches.js').Watch[]} watches - Fetched watches ([] when not configured).
 * @property {number} fetchedAt - Completion time in milliseconds since the epoch.
 */

/**
 * Fetch every watch and update failure counter, cache, badge and notifications.
 *
 * @param {string} reason - What triggered the refresh, e.g. 'alarm' or 'popup'; used in logs only.
 * @returns {Promise<RefreshResult>} The fetched watches.
 * @throws {Error} When the server cannot be queried; the failure is recorded first.
 */
export async function refreshWatches(reason) {
  const settings = await loadSettings();
  if (!isConfigured(settings)) {
    await clearBadge();
    log.debug('Refresh skipped (%s): server URL or API key not set', reason);
    return { configured: false, watches: [], fetchedAt: Date.now() };
  }
  const started = Date.now();
  let watches;
  try {
    if (!(await hasHostPermission(settings.baseURL))) {
      throw new ApiError(`Access to ${settings.baseURL} is not granted`, { kind: 'permission' });
    }
    watches = normalizeWatchList(await new ChangeDetectionClient(settings).listWatches());
  } catch (error) {
    await recordFailure(reason, error);
    throw error;
  }
  const fetchedAt = Date.now();
  const unread = countUnread(watches);
  await chrome.storage.session.set({ [FAILURE_COUNT_KEY]: 0 });
  await writeWatchCache(watches, fetchedAt);
  await showUnreadBadge(unread);
  try {
    await notifyNewChanges(watches, settings.notificationsEnabled);
  } catch (error) {
    log.warn('Could not show notification: %s', error.message);
  }
  log.info('Refreshed watches (%s): %d watches, %d unread in %d ms', reason, watches.length, unread, fetchedAt - started);
  return { configured: true, watches, fetchedAt };
}

/**
 * Count one failed refresh and show the error badge from the second failure in a row.
 *
 * @param {string} reason - What triggered the refresh.
 * @param {Error} error - The failure.
 * @returns {Promise<void>} Resolves when the counter and badge are updated.
 */
async function recordFailure(reason, error) {
  const { [FAILURE_COUNT_KEY]: previous = 0 } = await chrome.storage.session.get(FAILURE_COUNT_KEY);
  const failures = previous + 1;
  await chrome.storage.session.set({ [FAILURE_COUNT_KEY]: failures });
  if (failures >= FAILURES_BEFORE_ERROR_BADGE) {
    await showErrorBadge(error.message);
    log.error('Refresh failed (%s), %d times in a row: %s', reason, failures, error.message);
  } else {
    log.warn('Refresh failed (%s), keeping previous badge: %s', reason, error.message);
  }
}
