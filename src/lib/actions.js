/**
 * @file Service-worker operations requested by the popup and options pages.
 *
 * They run in the service worker so they finish even when the popup closes (it closes as
 * soon as a foreground tab opens).
 */
import { ChangeDetectionClient } from './api.js';
import { showUnreadBadge } from './badge.js';
import { markCachedViewed } from './cache.js';
import { createLogger } from './log.js';
import { loadSettings, validateConnection } from './settings.js';
import { countUnread } from './watches.js';

const log = createLogger('actions');

export const MARK_ALL_CONCURRENCY = 4;

/**
 * Mark watches viewed in the cache and update the badge from it (no refetch).
 *
 * @param {string[]} uuids - Watches just marked viewed.
 * @returns {Promise<void>} Resolves when done; does nothing without a cache.
 */
async function syncBadgeAfterMarking(uuids) {
  const watches = await markCachedViewed(uuids);
  if (watches) await showUnreadBadge(countUnread(watches));
}

/**
 * Open a watch in a new tab and, when it has changed, mark it viewed.
 *
 * @param {{uuid: string, url: string, lastChanged?: number, background?: boolean}} request - Watch UUID, URL to open, the watch's last_changed, and whether to open the tab in the background.
 * @returns {Promise<void>} Resolves when the tab is open and the watch is marked.
 */
export async function openWatch({ uuid, url, lastChanged = 0, background = false }) {
  await chrome.tabs.create({ url, active: !background });
  if (!(Number(lastChanged) > 0)) {
    log.info('Opened watch %s (no changes to mark)', uuid);
    return;
  }
  const client = new ChangeDetectionClient(await loadSettings());
  await client.markViewed(uuid, lastChanged);
  await syncBadgeAfterMarking([uuid]);
  log.info('Opened watch %s and marked it viewed', uuid);
}

/**
 * Mark several watches viewed, MARK_ALL_CONCURRENCY requests at a time.
 *
 * @param {{uuid: string, lastChanged: number}[]} items - Watches to mark.
 * @returns {Promise<{markedUuids: string[], failed: number}>} UUIDs marked successfully and the number of failures.
 */
export async function markAllViewed(items) {
  const client = new ChangeDetectionClient(await loadSettings());
  const queue = [...items];
  const markedUuids = [];
  let failed = 0;
  const worker = async () => {
    while (queue.length > 0) {
      const { uuid, lastChanged } = queue.shift();
      try {
        await client.markViewed(uuid, lastChanged);
        markedUuids.push(uuid);
      } catch (error) {
        failed += 1;
        log.debug('Could not mark watch %s viewed: %s', uuid, error.message);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(MARK_ALL_CONCURRENCY, items.length) }, worker));
  await syncBadgeAfterMarking(markedUuids);
  if (failed > 0) log.warn('Marked %d of %d watches viewed; %d failed', markedUuids.length, items.length, failed);
  else log.info('Marked %d watches viewed', markedUuids.length);
  return { markedUuids, failed };
}

/**
 * Check a server URL and API key without saving them.
 *
 * @param {{baseURL: string, apiKey: string}} credentials - Unsaved form values.
 * @returns {Promise<{version: string, watchCount: number}>} Server version and number of watches.
 * @throws {Error} When the values are invalid or the server cannot be queried.
 */
export async function testConnection({ baseURL, apiKey }) {
  const check = validateConnection({ baseURL, apiKey });
  if (!check.ok) throw new Error(check.error);
  try {
    const info = await new ChangeDetectionClient(check.value).systemInfo();
    const result = { version: String(info?.version ?? 'unknown'), watchCount: Number(info?.watch_count) || 0 };
    log.info('Connection test passed: %s runs version %s with %d watches', check.value.baseURL, result.version, result.watchCount);
    return result;
  } catch (error) {
    log.warn('Connection test failed for %s: %s', check.value.baseURL, error.message);
    throw error;
  }
}

/**
 * Create a watch for a page.
 *
 * @param {{url: string}} request - Page URL to monitor.
 * @returns {Promise<{uuid: string}>} UUID of the new watch.
 */
export async function addWatch({ url }) {
  const result = await new ChangeDetectionClient(await loadSettings()).createWatch(url);
  const uuid = String(result?.uuid ?? '');
  log.info('Added watch for %s: uuid=%s', url, uuid);
  return { uuid };
}

/**
 * Ask the server to recheck every watch.
 *
 * @returns {Promise<{message: string}>} Server status message.
 */
export async function recheckAll() {
  const result = await new ChangeDetectionClient(await loadSettings()).recheckAll();
  const message = String(result?.status ?? 'Recheck queued');
  log.info('Requested recheck of all watches: %s', message);
  return { message };
}
