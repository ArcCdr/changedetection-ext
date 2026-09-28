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
