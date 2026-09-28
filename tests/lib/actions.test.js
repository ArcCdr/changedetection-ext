import { addWatch, markAllViewed, MARK_ALL_CONCURRENCY, openWatch, recheckAll, testConnection } from '../../src/lib/actions.js';
import { readWatchCache, writeWatchCache } from '../../src/lib/cache.js';
import { allLogText, hasLog } from '../helpers/logs.js';

const BASE = 'http://192.168.1.10:5000';

/**
 * Fake fetch Response.
 *
 * @param {*} body - JSON body.
 * @param {number} status - HTTP status.
 * @returns {object} Response-like object.
 */
function jsonResponse(body, status = 200) {
  return { ok: status < 300, status, json: async () => body };
}

beforeEach(async () => {
  await chrome.storage.sync.set({ baseURL: BASE, apiKey: 'secret-key' });
});

describe('openWatch', () => {
  test('opens a foreground tab, marks the watch viewed and updates badge from the cache', async () => {
    await writeWatchCache([
      { uuid: 'a', last_changed: 100, viewed: false },
      { uuid: 'b', last_changed: 100, viewed: false },
    ], 1);
    globalThis.fetch.mockResolvedValue(jsonResponse('OK'));
    await openWatch({ uuid: 'a', url: `${BASE}/diff/a`, lastChanged: 100 });
    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: `${BASE}/diff/a`, active: true });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch.mock.calls[0][0]).toBe(`${BASE}/api/v1/watch/a`);
    expect(globalThis.fetch.mock.calls[0][1].method).toBe('PUT');
    expect((await readWatchCache()).watches[0].viewed).toBe(true);
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '1' });
    expect(hasLog('info', '[cdio:actions] Opened watch a and marked it viewed')).toBe(true);
  });

  test('background: true opens an inactive tab', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse('OK'));
    await openWatch({ uuid: 'a', url: 'https://x', lastChanged: 5, background: true });
    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: 'https://x', active: false });
  });

  test('never-changed watch: opens the tab without any request', async () => {
    await openWatch({ uuid: 'n', url: 'https://site', lastChanged: 0 });
    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: 'https://site', active: true });
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(hasLog('info', 'Opened watch n (no changes to mark)')).toBe(true);
  });

  test('a failed PUT rejects after the tab was opened', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse('no', 500));
    await expect(openWatch({ uuid: 'a', url: 'https://x', lastChanged: 5 })).rejects.toMatchObject({ kind: 'http' });
    expect(chrome.tabs.create).toHaveBeenCalled();
  });
});

describe('markAllViewed', () => {
  test('marks every item with at most MARK_ALL_CONCURRENCY requests in flight', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    globalThis.fetch.mockImplementation(async () => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 1));
      inFlight -= 1;
      return jsonResponse('OK');
    });
    const items = Array.from({ length: 10 }, (_, i) => ({ uuid: `u${i}`, lastChanged: 5 }));
    const result = await markAllViewed(items);
    expect(result).toEqual({ markedUuids: expect.arrayContaining(items.map((i) => i.uuid)), failed: 0 });
    expect(result.markedUuids).toHaveLength(10);
    expect(globalThis.fetch).toHaveBeenCalledTimes(10);
    expect(maxInFlight).toBe(MARK_ALL_CONCURRENCY);
    expect(hasLog('info', '[cdio:actions] Marked 10 watches viewed')).toBe(true);
  });

  test('reports failures, updates the cache for successes only and warns once', async () => {
    await writeWatchCache([
      { uuid: 'ok', last_changed: 5, viewed: false },
      { uuid: 'bad', last_changed: 5, viewed: false },
    ], 1);
    globalThis.fetch.mockImplementation(async (url) => (url.endsWith('/bad') ? jsonResponse('x', 500) : jsonResponse('OK')));
    const result = await markAllViewed([{ uuid: 'ok', lastChanged: 5 }, { uuid: 'bad', lastChanged: 5 }]);
    expect(result).toEqual({ markedUuids: ['ok'], failed: 1 });
    expect((await readWatchCache()).watches.map((w) => w.viewed)).toEqual([true, false]);
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '1' });
    expect(hasLog('warn', 'Marked 1 of 2 watches viewed; 1 failed')).toBe(true);
    expect(hasLog('debug', 'Could not mark watch bad viewed: Server error (HTTP 500)')).toBe(true);
  });

  test('an empty list makes no requests', async () => {
    expect(await markAllViewed([])).toEqual({ markedUuids: [], failed: 0 });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe('testConnection', () => {
  test('queries systeminfo with the unsaved values and does not store them', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse({ version: '0.50.12', watch_count: 7 }));
    const result = await testConnection({ baseURL: 'http://other:5000/', apiKey: ' new-key ' });
    expect(result).toEqual({ version: '0.50.12', watchCount: 7 });
    expect(globalThis.fetch.mock.calls[0][0]).toBe('http://other:5000/api/v1/systeminfo');
    expect(globalThis.fetch.mock.calls[0][1].headers['x-api-key']).toBe('new-key');
    expect(await chrome.storage.sync.get(null)).toEqual({ baseURL: BASE, apiKey: 'secret-key' });
    expect(hasLog('info', 'Connection test passed: http://other:5000 runs version 0.50.12 with 7 watches')).toBe(true);
    expect(allLogText()).not.toContain('new-key');
  });

  test('invalid values reject without a request', async () => {
    await expect(testConnection({ baseURL: 'nope', apiKey: 'k' })).rejects.toThrow(
      'Enter a valid http:// or https:// URL, e.g. http://192.168.1.10:5000',
    );
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test('server errors reject and warn', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse('x', 403));
    await expect(testConnection({ baseURL: BASE, apiKey: 'bad' })).rejects.toMatchObject({ kind: 'auth' });
    expect(hasLog('warn', `Connection test failed for ${BASE}: API key rejected (HTTP 403)`)).toBe(true);
  });

  test('missing fields fall back to unknown / 0', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse({}));
    expect(await testConnection({ baseURL: BASE, apiKey: 'k' })).toEqual({ version: 'unknown', watchCount: 0 });
  });
});

describe('addWatch', () => {
  test('POSTs the url and returns the uuid', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse({ uuid: 'new-1' }, 201));
    expect(await addWatch({ url: 'https://example.com/p' })).toEqual({ uuid: 'new-1' });
    expect(JSON.parse(globalThis.fetch.mock.calls[0][1].body)).toEqual({ url: 'https://example.com/p' });
    expect(hasLog('info', 'Added watch for https://example.com/p: uuid=new-1')).toBe(true);
  });

  test('returns an empty uuid when the server omits it', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse(null, 201));
    expect(await addWatch({ url: 'https://example.com/p' })).toEqual({ uuid: '' });
  });
});

describe('recheckAll', () => {
  test('returns the server status message', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse({ status: 'OK, queued 4 watches for rechecking' }));
    expect(await recheckAll()).toEqual({ message: 'OK, queued 4 watches for rechecking' });
    expect(hasLog('info', 'Requested recheck of all watches: OK, queued 4 watches for rechecking')).toBe(true);
  });

  test('falls back to a generic message', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse({}));
    expect(await recheckAll()).toEqual({ message: 'Recheck queued' });
  });
});
