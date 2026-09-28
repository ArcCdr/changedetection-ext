/**
 * @file Extension settings: defaults, validation, loading, and host-permission helpers.
 *
 * Settings live in chrome.storage.sync under SETTINGS_KEYS. The server origin must also be
 * granted as an optional host permission, otherwise Chrome blocks requests to servers on the
 * local network.
 */

export const DEFAULT_REFRESH_MINUTES = 5;
export const MIN_REFRESH_MINUTES = 1;
export const MAX_REFRESH_MINUTES = 1440;
export const SETTINGS_KEYS = ['baseURL', 'apiKey', 'refreshInterval', 'notificationsEnabled'];

/**
 * Normalize a user-entered server URL.
 *
 * @param {*} input - Raw text from the Server URL field or storage.
 * @returns {string|null} Origin plus path, without trailing slashes and without a pasted `/api…` suffix; null when not an http(s) URL.
 */
export function normalizeBaseUrl(input) {
  let url;
  try {
    url = new URL(String(input ?? '').trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  const path = url.pathname.replace(/\/api(\/.*)?$/i, '').replace(/\/+$/, '');
  return `${url.origin}${path}`;
}

/**
 * Whether a refresh interval is allowed.
 *
 * @param {*} value - Candidate number of minutes.
 * @returns {boolean} True for an integer from MIN_REFRESH_MINUTES to MAX_REFRESH_MINUTES.
 */
export function isValidRefreshInterval(value) {
  return Number.isInteger(value) && value >= MIN_REFRESH_MINUTES && value <= MAX_REFRESH_MINUTES;
}

/**
 * Validate the server URL and API key typed by the user.
 *
 * @param {{baseURL: string, apiKey: string}} input - Raw form values.
 * @returns {{ok: true, value: {baseURL: string, apiKey: string}}|{ok: false, error: string}} Normalized values or a user-facing error.
 */
export function validateConnection({ baseURL, apiKey }) {
  if (!String(baseURL ?? '').trim()) return { ok: false, error: 'Enter your server URL.' };
  const normalized = normalizeBaseUrl(baseURL);
  if (!normalized) {
    return { ok: false, error: 'Enter a valid http:// or https:// URL, e.g. http://192.168.1.10:5000' };
  }
  const key = String(apiKey ?? '').trim();
  if (!key) return { ok: false, error: 'Enter your API key.' };
  return { ok: true, value: { baseURL: normalized, apiKey: key } };
}

/**
 * Validate all fields saved by the options page.
 *
 * @param {{baseURL: string, apiKey: string, refreshInterval: number}} input - Raw form values; refreshInterval already converted with Number().
 * @returns {{ok: true, value: {baseURL: string, apiKey: string, refreshInterval: number}}|{ok: false, error: string}} Normalized values or a user-facing error.
 */
export function validateSettings({ baseURL, apiKey, refreshInterval }) {
  const connection = validateConnection({ baseURL, apiKey });
  if (!connection.ok) return connection;
  if (!isValidRefreshInterval(refreshInterval)) {
    return {
      ok: false,
      error: `Refresh interval must be a whole number from ${MIN_REFRESH_MINUTES} to ${MAX_REFRESH_MINUTES} minutes.`,
    };
  }
  return { ok: true, value: { ...connection.value, refreshInterval } };
}

/**
 * Host-permission match pattern covering a server URL on any port.
 *
 * @param {string} baseURL - Normalized server URL.
 * @returns {string} Pattern such as 'http://192.168.1.10/*'.
 */
export function hostPermissionPattern(baseURL) {
  const url = new URL(baseURL);
  return `${url.protocol}//${url.hostname}/*`;
}

/**
 * Saved extension settings with defaults applied.
 *
 * @typedef {object} Settings
 * @property {string} baseURL - Normalized server URL, '' when unset.
 * @property {string} apiKey - API key, '' when unset.
 * @property {number} refreshInterval - Minutes between background refreshes.
 * @property {boolean} notificationsEnabled - Whether desktop notifications are on.
 */

/**
 * Load saved settings and apply defaults.
 *
 * @returns {Promise<Settings>} The settings; an invalid saved URL loads as ''.
 */
export async function loadSettings() {
  const stored = await chrome.storage.sync.get(SETTINGS_KEYS);
  return {
    baseURL: normalizeBaseUrl(stored.baseURL) ?? '',
    apiKey: typeof stored.apiKey === 'string' ? stored.apiKey.trim() : '',
    refreshInterval: isValidRefreshInterval(stored.refreshInterval) ? stored.refreshInterval : DEFAULT_REFRESH_MINUTES,
    notificationsEnabled: stored.notificationsEnabled === true,
  };
}

/**
 * Whether the extension can talk to a server.
 *
 * @param {Settings} settings - Loaded settings.
 * @returns {boolean} True when both baseURL and apiKey are non-empty.
 */
export function isConfigured(settings) {
  return Boolean(settings.baseURL && settings.apiKey);
}

/**
 * Whether Chrome already granted access to the server origin.
 *
 * @param {string} baseURL - Normalized server URL.
 * @returns {Promise<boolean>} Result of chrome.permissions.contains.
 */
export function hasHostPermission(baseURL) {
  return chrome.permissions.contains({ origins: [hostPermissionPattern(baseURL)] });
}

/**
 * Ask Chrome for access to the server origin.
 *
 * Call it synchronously from a click or submit handler, before any `await`, or Chrome
 * rejects the request for lacking a user gesture.
 *
 * @param {string} baseURL - Normalized server URL.
 * @returns {Promise<boolean>} True when access is granted.
 */
export function requestHostPermission(baseURL) {
  return chrome.permissions.request({ origins: [hostPermissionPattern(baseURL)] });
}
