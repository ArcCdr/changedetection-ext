import { ApiError, ChangeDetectionClient, REQUEST_TIMEOUT_MS } from '../../src/lib/api.js';
import { allLogText, hasLog } from '../helpers/logs.js';

const BASE = 'http://192.168.1.10:5000';
const KEY = 'secret-key-123';

/**
 * Fake fetch Response.
 *
 * @param {*} body - JSON body.
 * @param {number} status - HTTP status.
 * @returns {object} Response-like object.
 */
function jsonResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

/**
 * Client with a mocked fetch.
 *
 * @param {Function} fetchImpl - Fetch mock.
 * @returns {ChangeDetectionClient} Client.
 */
function client(fetchImpl) {
  return new ChangeDetectionClient({ baseURL: BASE, apiKey: KEY, fetchImpl });
}

describe('ApiError', () => {
  test('carries kind and status', () => {
    const error = new ApiError('msg', { kind: 'auth', status: 403 });
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiError');
    expect(error.message).toBe('msg');
    expect(error.kind).toBe('auth');
    expect(error.status).toBe(403);
    expect(new ApiError('m', { kind: 'network' }).status).toBe(0);
  });
});

describe('ChangeDetectionClient.request', () => {
  test('GET sends only the API key header and a timeout signal', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse({ ok: 1 }));
    expect(await client(fetchImpl).request('/api/v1/watch')).toEqual({ ok: 1 });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(`${BASE}/api/v1/watch`);
    expect(init.method).toBe('GET');
    expect(init.headers).toEqual({ 'x-api-key': KEY });
    expect(init.body).toBeUndefined();
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  test('a body adds JSON content type', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse('OK'));
    await client(fetchImpl).request('/api/v1/watch/x', { method: 'PUT', body: { last_viewed: 1 } });
    const [, init] = fetchImpl.mock.calls[0];
    expect(init.headers).toEqual({ 'x-api-key': KEY, 'Content-Type': 'application/json' });
    expect(init.body).toBe('{"last_viewed":1}');
  });

  test.each([
    [401, 'auth', 'API key rejected (HTTP 401)'],
    [403, 'auth', 'API key rejected (HTTP 403)'],
    [404, 'not_found', 'API not found (HTTP 404). Check the server URL.'],
    [500, 'http', 'Server error (HTTP 500)'],
  ])('HTTP %d becomes ApiError kind %s', async (status, kind, message) => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse('<html>proxy page</html>', status));
    await expect(client(fetchImpl).request('/api/v1/watch')).rejects.toMatchObject({ name: 'ApiError', kind, status, message });
  });

  test('network failure becomes kind network', async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(client(fetchImpl).request('/api/v1/watch')).rejects.toMatchObject({
      kind: 'network',
      status: 0,
      message: `Cannot reach ${BASE}`,
    });
  });

  test.each([['TimeoutError'], ['AbortError']])('%s becomes kind timeout', async (name) => {
    const fetchImpl = jest.fn().mockRejectedValue(new DOMException('timed out', name));
    await expect(client(fetchImpl).request('/api/v1/watch')).rejects.toMatchObject({
      kind: 'timeout',
      message: `Server did not respond within ${REQUEST_TIMEOUT_MS / 1000} s`,
    });
  });

  test('non-JSON body becomes kind invalid_response', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => { throw new SyntaxError('bad'); } });
    await expect(client(fetchImpl).request('/api/v1/watch')).rejects.toMatchObject({
      kind: 'invalid_response',
      status: 200,
      message: 'Server sent an invalid response (not JSON)',
    });
  });

  test('logs each request at debug level and never logs the API key', async () => {
    const fetchImpl = jest.fn().mockResolvedValueOnce(jsonResponse({})).mockRejectedValueOnce(new TypeError('x'));
    await client(fetchImpl).request('/api/v1/watch');
    await expect(client(fetchImpl).request('/api/v1/systeminfo')).rejects.toThrow();
    expect(hasLog('debug', /\[cdio:api\] GET \/api\/v1\/watch -> HTTP 200 in \d+ ms/)).toBe(true);
    expect(hasLog('debug', /\[cdio:api\] GET \/api\/v1\/systeminfo failed after \d+ ms: TypeError/)).toBe(true);
    expect(allLogText()).not.toContain(KEY);
  });

  test('defaults to the global fetch', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse([]));
    await new ChangeDetectionClient({ baseURL: BASE, apiKey: KEY }).request('/api/v1/watch');
    expect(globalThis.fetch).toHaveBeenCalledWith(`${BASE}/api/v1/watch`, expect.any(Object));
  });
});
