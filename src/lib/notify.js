/**
 * @file Opt-in desktop notifications for watches that changed since the previous refresh.
 *
 * Every refresh stores the UUIDs of currently unread watches in chrome.storage.local under
 * NOTIFIED_KEY, so enabling notifications never announces old changes, and a watch is
 * announced again only after it was viewed and then changed again.
 */
import { createLogger } from './log.js';
import { diffUrl, displayTitle, isUnread, primaryUrl } from './watches.js';

const log = createLogger('notify');

export const NOTIFIED_KEY = 'notifiedUuids';
export const WATCH_NOTIFICATION_PREFIX = 'cdio-watch:';
export const SUMMARY_NOTIFICATION_ID = 'cdio-changes';
export const MAX_TITLES = 3;

/**
 * Announce watches that became unread since the previous refresh.
 *
 * @param {import('./watches.js').Watch[]} watches - Freshly fetched watches.
 * @param {boolean} enabled - The notificationsEnabled setting.
 * @returns {Promise<number>} Number of watches announced; 0 when disabled, nothing is new, or permission is missing.
 */
export async function notifyNewChanges(watches, enabled) {
  const unread = watches.filter(isUnread);
  const { [NOTIFIED_KEY]: previous } = await chrome.storage.local.get(NOTIFIED_KEY);
  await chrome.storage.local.set({ [NOTIFIED_KEY]: unread.map((watch) => watch.uuid) });
  if (!Array.isArray(previous)) {
    log.debug('Stored notification baseline: %d unread', unread.length);
    return 0;
  }
  const fresh = unread.filter((watch) => !previous.includes(watch.uuid));
  if (!enabled || fresh.length === 0) return 0;
  if (!chrome.notifications || !(await chrome.permissions.contains({ permissions: ['notifications'] }))) {
    log.warn('Notifications are on but Chrome permission is missing; %d changes not shown', fresh.length);
    return 0;
  }
  const names = fresh.slice(0, MAX_TITLES).map(displayTitle);
  const more = fresh.length - names.length;
  const id = fresh.length === 1 ? `${WATCH_NOTIFICATION_PREFIX}${fresh[0].uuid}` : SUMMARY_NOTIFICATION_ID;
  await chrome.notifications.create(id, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon128.png'),
    title: fresh.length === 1 ? 'Watch changed' : `${fresh.length} watches changed`,
    message: more > 0 ? `${names.join(', ')} and ${more} more` : names.join(', '),
  });
  log.info('Notified %d changed watches', fresh.length);
  return fresh.length;
}

/**
 * What to open when a notification is clicked.
 *
 * @param {string} notificationId - ID passed to chrome.notifications.create.
 * @param {string} baseURL - Normalized server URL.
 * @param {import('./watches.js').Watch[]} watches - Cached watches; [] when there is no cache.
 * @returns {{url: string, uuid?: string, lastChanged?: number}} For a single-watch notification, an openWatch
 *   request: the watch's primaryUrl and last_changed, or its diff page and 0 when the watch is not in `watches`.
 *   For the summary notification, `{url: baseURL}`.
 */
export function notificationClickTarget(notificationId, baseURL, watches) {
  if (!notificationId.startsWith(WATCH_NOTIFICATION_PREFIX)) return { url: baseURL };
  const uuid = notificationId.slice(WATCH_NOTIFICATION_PREFIX.length);
  const watch = watches.find((candidate) => candidate.uuid === uuid);
  if (!watch) {
    log.warn('Watch %s is not in the cache; opening its diff page without marking it viewed', uuid);
    return { uuid, url: diffUrl(baseURL, uuid), lastChanged: 0 };
  }
  return { uuid, url: primaryUrl(baseURL, watch), lastChanged: Number(watch.last_changed) || 0 };
}
