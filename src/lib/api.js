/**
 * @file Minimal client for the changedetection.io REST API v1.
 *
 * Every request sends the `x-api-key` header, times out after REQUEST_TIMEOUT_MS and turns
 * failures into an ApiError with a user-safe message (response bodies are never surfaced).
 * Requires changedetection.io 0.50.12 or newer, the first version that accepts `last_viewed`
 * in `PUT /api/v1/watch/{uuid}`.
 */
import { createLogger } from './log.js';

const log = createLogger('api');

export const REQUEST_TIMEOUT_MS = 15000;

/**
 * Failure of an API call, safe to show to the user.
 *
 * `kind` is one of 'auth', 'not_found', 'http', 'network', 'timeout', 'invalid_response' or
 * 'permission'; `status` is the HTTP status, 0 when no response was received.
 */
export class ApiError extends Error {
  /**
   * Create an ApiError.
   *
   * @param {string} message - User-safe description.
   * @param {{kind: string, status?: number}} details - Error category and HTTP status.
   */
  constructor(message, { kind, status = 0 }) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

/**
 * Map a non-2xx HTTP status to an ApiError.
 *
 * @param {number} status - HTTP status code.
 * @returns {ApiError} The error to throw.
 */
function httpError(status) {
  if (status === 401 || status === 403) {
    return new ApiError(`API key rejected (HTTP ${status})`, { kind: 'auth', status });
  }
  if (status === 404) {
    return new ApiError('API not found (HTTP 404). Check the server URL.', { kind: 'not_found', status });
  }
  return new ApiError(`Server error (HTTP ${status})`, { kind: 'http', status });
}

/** Client bound to one server URL and API key. */
export class ChangeDetectionClient {
  /**
   * Create a client.
   *
   * @param {{baseURL: string, apiKey: string, fetchImpl?: Function, timeoutMs?: number}} options - Normalized server URL, API key, optional fetch replacement and timeout.
   */
  constructor({ baseURL, apiKey, fetchImpl = (input, init) => globalThis.fetch(input, init), timeoutMs = REQUEST_TIMEOUT_MS }) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.fetchImpl = fetchImpl;
    this.timeoutMs = timeoutMs;
  }

  /**
   * Send one request and parse the JSON response.
   *
   * @param {string} path - Path starting with '/api/v1/'.
   * @param {{method?: string, body?: object}} [options] - HTTP method (default 'GET') and JSON body.
   * @returns {Promise<*>} Parsed response body.
   * @throws {ApiError} On timeout, network failure, non-2xx status or a non-JSON body.
   */
  async request(path, { method = 'GET', body } = {}) {
    const headers = { 'x-api-key': this.apiKey };
    const init = { method, headers, signal: AbortSignal.timeout(this.timeoutMs) };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
    const started = Date.now();
    let response;
    try {
      response = await this.fetchImpl(`${this.baseURL}${path}`, init);
    } catch (error) {
      log.debug('%s %s failed after %d ms: %s', method, path, Date.now() - started, error?.name);
      if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
        throw new ApiError(`Server did not respond within ${this.timeoutMs / 1000} s`, { kind: 'timeout' });
      }
      throw new ApiError(`Cannot reach ${this.baseURL}`, { kind: 'network' });
    }
    log.debug('%s %s -> HTTP %d in %d ms', method, path, response.status, Date.now() - started);
    if (!response.ok) throw httpError(response.status);
    try {
      return await response.json();
    } catch {
      throw new ApiError('Server sent an invalid response (not JSON)', { kind: 'invalid_response', status: response.status });
    }
  }

  /**
   * Fetch every watch.
   *
   * @returns {Promise<object>} Raw response: an object keyed by watch UUID.
   */
  listWatches() {
    return this.request('/api/v1/watch');
  }

  /**
   * Mark one watch viewed by setting its last_viewed timestamp.
   *
   * @param {string} uuid - Watch UUID.
   * @param {number} [lastChanged] - The watch's last_changed; last_viewed is max(now, lastChanged) to absorb clock skew.
   * @returns {Promise<void>} Resolves when the server accepted the update.
   */
  async markViewed(uuid, lastChanged = 0) {
    const lastViewed = Math.max(Math.floor(Date.now() / 1000), Number(lastChanged) || 0);
    await this.request(`/api/v1/watch/${encodeURIComponent(uuid)}`, { method: 'PUT', body: { last_viewed: lastViewed } });
  }

  /**
   * Fetch server information (cheap; used by the connection test).
   *
   * @returns {Promise<{version: string, watch_count: number}>} Server version and watch count, among other fields.
   */
  systemInfo() {
    return this.request('/api/v1/systeminfo');
  }

  /**
   * Create a watch for a page.
   *
   * @param {string} url - Page URL to monitor.
   * @returns {Promise<{uuid: string}>} UUID of the new watch.
   */
  createWatch(url) {
    return this.request('/api/v1/watch', { method: 'POST', body: { url } });
  }

  /**
   * Queue a recheck of every watch.
   *
   * @returns {Promise<{status: string}>} Server status message, e.g. 'OK, queued 12 watches for rechecking'.
   */
  recheckAll() {
    return this.request('/api/v1/watch?recheck_all=1');
  }
}
