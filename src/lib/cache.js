/**
 * @file Last fetched watch list, kept in chrome.storage.session so the popup renders instantly.
 *
 * Session storage is readable by the popup and the service worker and is cleared when the
 * browser restarts.
 */

export const CACHE_KEY = 'watchCache';

/**
 * Cached watch list.
 *
 * @typedef {object} WatchCache
 * @property {import('./watches.js').Watch[]} watches - Watches from the last successful refresh.
 * @property {number} fetchedAt - When they were fetched, in milliseconds since the epoch.
 */

/**
 * Read the cached watch list.
 *
 * @returns {Promise<WatchCache|null>} The cache, or null when missing or malformed.
 */
export async function readWatchCache() {
  const { [CACHE_KEY]: cache } = await chrome.storage.session.get(CACHE_KEY);
  return cache && Array.isArray(cache.watches) ? cache : null;
}

/**
 * Replace the cached watch list.
 *
 * @param {import('./watches.js').Watch[]} watches - Watches to cache.
 * @param {number} [fetchedAt] - Fetch time in milliseconds; defaults to Date.now().
 * @returns {Promise<void>} Resolves when stored.
 */
export async function writeWatchCache(watches, fetchedAt = Date.now()) {
  await chrome.storage.session.set({ [CACHE_KEY]: { watches, fetchedAt } });
}

/**
 * Delete the cached watch list.
 *
 * @returns {Promise<void>} Resolves when removed.
 */
export async function clearWatchCache() {
  await chrome.storage.session.remove(CACHE_KEY);
}

/**
 * Set viewed = true on cached watches.
 *
 * @param {string[]} uuids - UUIDs of the watches just marked viewed.
 * @returns {Promise<import('./watches.js').Watch[]|null>} The updated watches, or null when there is no cache.
 */
export async function markCachedViewed(uuids) {
  const cache = await readWatchCache();
  if (!cache) return null;
  const marked = new Set(uuids);
  const watches = cache.watches.map((watch) => (marked.has(watch.uuid) ? { ...watch, viewed: true } : watch));
  await writeWatchCache(watches, cache.fetchedAt);
  return watches;
}
