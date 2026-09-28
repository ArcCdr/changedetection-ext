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
