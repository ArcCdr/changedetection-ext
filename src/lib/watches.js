/**
 * @file Pure helpers for changedetection.io watch objects (no chrome.* or network access).
 *
 * `GET /api/v1/watch` returns an object keyed by watch UUID. Each value carries
 * `last_changed`, `last_checked`, `last_error`, `link`, `open_link`, `page_title`, `tags`,
 * `title`, `url` and `viewed`. Timestamps are Unix seconds; `last_changed` stays 0 until the
 * watch has at least two snapshots, and a brand-new watch reports `viewed: false`.
 */

/**
 * One watch from the list endpoint, plus its UUID.
 *
 * @typedef {object} Watch
 * @property {string} uuid - Watch UUID (the key in the API response).
 * @property {string} url - Monitored URL.
 * @property {string|null} [title] - User-defined title.
 * @property {string|null} [page_title] - Title scraped from the monitored page.
 * @property {string} [link] - Rendered URL; 'DISABLED' or '' when unusable.
 * @property {string} [open_link] - "Link to open" override, otherwise equal to link.
 * @property {number} last_changed - Unix seconds of the latest change, 0 when none.
 * @property {number} [last_checked] - Unix seconds of the latest check.
 * @property {string|false} [last_error] - Latest error message, or false.
 * @property {boolean} viewed - Server-side viewed flag.
 */

/**
 * Convert the list-endpoint response into an array of watches.
 *
 * @param {*} response - Parsed JSON body of `GET /api/v1/watch`.
 * @returns {Watch[]} One entry per UUID key, each with `uuid` added.
 * @throws {TypeError} When the response is not a plain object.
 */
export function normalizeWatchList(response) {
  if (response === null || typeof response !== 'object' || Array.isArray(response)) {
    throw new TypeError('Unexpected watch list format from server');
  }
  return Object.entries(response).map(([uuid, watch]) => ({ ...watch, uuid }));
}

/**
 * Whether a watch has a change the user has not viewed.
 *
 * @param {Watch} watch - The watch.
 * @returns {boolean} True when last_changed > 0 and viewed is false.
 */
export function isUnread(watch) {
  return Number(watch.last_changed) > 0 && watch.viewed === false;
}

/**
 * Count unread watches.
 *
 * @param {Watch[]} watches - The watches.
 * @returns {number} Number of watches for which isUnread() is true.
 */
export function countUnread(watches) {
  return watches.filter(isUnread).length;
}

/**
 * Title to show for a watch.
 *
 * @param {Watch} watch - The watch.
 * @returns {string} title, else page_title, else url, else 'Untitled watch'.
 */
export function displayTitle(watch) {
  return watch.title || watch.page_title || watch.url || 'Untitled watch';
}

/**
 * URL of the monitored page.
 *
 * @param {Watch} watch - The watch.
 * @returns {string|null} First of open_link, link, url that starts with http:// or https://, else null.
 */
export function siteUrl(watch) {
  const candidates = [watch.open_link, watch.link, watch.url];
  return candidates.find((value) => typeof value === 'string' && /^https?:\/\//i.test(value)) ?? null;
}

/**
 * URL opened when the user clicks a watch row.
 *
 * @param {string} baseURL - Normalized server URL without trailing slash.
 * @param {Watch} watch - The watch.
 * @returns {string} The server diff page when the watch has changed; otherwise siteUrl(watch), or baseURL when that is null.
 */
export function primaryUrl(baseURL, watch) {
  if (Number(watch.last_changed) > 0) return `${baseURL}/diff/${encodeURIComponent(watch.uuid)}`;
  return siteUrl(watch) ?? baseURL;
}

/**
 * Sort watches for display.
 *
 * @param {Watch[]} watches - The watches (not modified).
 * @returns {Watch[]} New array: unread first, then newest last_changed first, then displayTitle A to Z.
 */
export function sortWatches(watches) {
  return [...watches].sort(
    (a, b) =>
      Number(isUnread(b)) - Number(isUnread(a)) ||
      (Number(b.last_changed) || 0) - (Number(a.last_changed) || 0) ||
      displayTitle(a).localeCompare(displayTitle(b)),
  );
}

/**
 * Keep the watches matching a free-text query.
 *
 * @param {Watch[]} watches - The watches.
 * @param {string} query - Text typed by the user.
 * @returns {Watch[]} Watches whose displayTitle or url contains the trimmed query (case-insensitive); the input array when the query is blank.
 */
export function filterWatches(watches, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return watches;
  return watches.filter(
    (watch) =>
      displayTitle(watch).toLowerCase().includes(needle) ||
      String(watch.url ?? '').toLowerCase().includes(needle),
  );
}

/**
 * Find the watch that monitors a page.
 *
 * @param {Watch[]} watches - The watches.
 * @param {string} url - Page URL.
 * @returns {Watch|undefined} The first watch whose url equals the page URL, ignoring the fragment and one trailing slash.
 */
export function findWatchByUrl(watches, url) {
  const target = comparableUrl(url);
  return watches.find((watch) => comparableUrl(watch.url) === target);
}

/**
 * Normalize a URL for equality checks.
 *
 * @param {*} value - URL string.
 * @returns {string} The parsed href without fragment and trailing slash, or String(value) when unparsable.
 */
function comparableUrl(value) {
  try {
    const url = new URL(String(value));
    url.hash = '';
    return url.href.replace(/\/$/, '');
  } catch {
    return String(value);
  }
}
