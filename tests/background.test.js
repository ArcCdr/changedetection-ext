import { handleMessage } from '../src/background.js';
import { flushPromises } from './helpers/dom.js';
import { hasLog } from './helpers/logs.js';

const BASE = 'http://192.168.1.10:5000';

/**
 * Make the global fetch answer with a JSON body.
 *
 * @param {*} body - JSON body.
 * @param {number} status - HTTP status.
 */
function respond(body, status = 200) {
  globalThis.fetch.mockResolvedValue({ ok: status < 300, status, json: async () => body });
}

/**
 * Store a complete configuration.
 *
 * @returns {Promise<void>} Done.
 */
function configure() {
  return chrome.storage.sync.set({ baseURL: BASE, apiKey: 'key', refreshInterval: 5 });
}

describe('message listener', () => {
  test('is registered at import time and answers asynchronously through sendResponse', async () => {
    expect(chrome.runtime.onMessage.hasListeners()).toBe(true);
    const sendResponse = jest.fn();
    const [keepOpen] = chrome.runtime.onMessage.dispatch({ action: 'nope' }, {}, sendResponse);
    expect(keepOpen).toBe(true);
    await flushPromises();
    expect(sendResponse).toHaveBeenCalledWith({ success: false, error: 'Unknown action: nope' });
  });
});

describe('handleMessage', () => {
  test('getWatches refreshes and returns watches with fetchedAt', async () => {
    await configure();
    respond({ a: { url: 'https://a', last_changed: 1, viewed: false } });
    const response = await handleMessage({ action: 'getWatches' });
    expect(response.success).toBe(true);
    expect(response.data.watches).toEqual([{ uuid: 'a', url: 'https://a', last_changed: 1, viewed: false }]);
    expect(typeof response.data.fetchedAt).toBe('number');
  });

  test('failures return the message and errorKind and log a warning', async () => {
    await configure();
    respond('x', 403);
    expect(await handleMessage({ action: 'getWatches' })).toEqual({
      success: false,
      error: 'API key rejected (HTTP 403)',
      errorKind: 'auth',
    });
    expect(hasLog('warn', '[cdio:background] Message getWatches failed: API key rejected (HTTP 403)')).toBe(true);
  });

  test('openWatch with no changes returns success without data', async () => {
    expect(await handleMessage({ action: 'openWatch', uuid: 'a', url: 'https://a', lastChanged: 0 })).toEqual({ success: true });
    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: 'https://a', active: true });
  });

  test('markAllViewed defaults items to []', async () => {
    await configure();
    expect(await handleMessage({ action: 'markAllViewed' })).toEqual({ success: true, data: { markedUuids: [], failed: 0 } });
  });

  test('testConnection, addWatch and recheckAll are routed', async () => {
    await configure();
    respond({ version: '1', watch_count: 2, uuid: 'n', status: 'OK' });
    expect((await handleMessage({ action: 'testConnection', baseURL: BASE, apiKey: 'k' })).data).toEqual({ version: '1', watchCount: 2 });
    expect((await handleMessage({ action: 'addWatch', url: 'https://x' })).data).toEqual({ uuid: 'n' });
    expect((await handleMessage({ action: 'recheckAll' })).data).toEqual({ message: 'OK' });
  });

  test('a missing request is an unknown action', async () => {
    expect(await handleMessage(undefined)).toEqual({ success: false, error: 'Unknown action: undefined' });
  });
});
