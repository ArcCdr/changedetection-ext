import { readWatchCache } from '../../src/lib/cache.js';
import { NOTIFIED_KEY } from '../../src/lib/notify.js';
import { FAILURE_COUNT_KEY, refreshWatches } from '../../src/lib/refresh.js';
import { hasLog } from '../helpers/logs.js';

const BASE = 'http://192.168.1.10:5000';
const LIST = {
  a: { url: 'https://a', title: 'A', last_changed: 100, viewed: false },
  b: { url: 'https://b', title: 'B', last_changed: 0, viewed: false },
};

/**
 * Store a complete configuration.
 *
 * @param {object} extra - Extra settings.
 * @returns {Promise<void>} Done.
 */
function configure(extra = {}) {
  return chrome.storage.sync.set({ baseURL: BASE, apiKey: 'key', ...extra });
}

/**
 * Make the global fetch answer with a JSON body.
 *
 * @param {*} body - JSON body.
 * @param {number} status - HTTP status.
 */
function respond(body, status = 200) {
  globalThis.fetch.mockResolvedValue({ ok: status < 300, status, json: async () => body });
}

describe('refreshWatches', () => {
  test('not configured: clears the badge, fetches nothing', async () => {
    const result = await refreshWatches('alarm');
    expect(result.configured).toBe(false);
    expect(result.watches).toEqual([]);
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '' });
    expect(hasLog('debug', 'Refresh skipped (alarm): server URL or API key not set')).toBe(true);
  });

  test('success: returns watches, caches them, shows the unread count, resets failures, logs info', async () => {
    await configure();
    await chrome.storage.session.set({ [FAILURE_COUNT_KEY]: 1 });
    respond(LIST);
    const result = await refreshWatches('alarm');
    expect(result.configured).toBe(true);
    expect(result.watches.map((w) => w.uuid)).toEqual(['a', 'b']);
    expect(globalThis.fetch).toHaveBeenCalledWith(`${BASE}/api/v1/watch`, expect.any(Object));
    expect((await readWatchCache()).watches).toEqual(result.watches);
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '1' });
    expect(await chrome.storage.session.get(FAILURE_COUNT_KEY)).toEqual({ [FAILURE_COUNT_KEY]: 0 });
    expect(hasLog('info', /\[cdio:refresh\] Refreshed watches \(alarm\): 2 watches, 1 unread in \d+ ms/)).toBe(true);
  });

  test('missing host permission fails with kind permission before fetching', async () => {
    await configure();
    chrome.permissions.contains.mockResolvedValueOnce(false);
    await expect(refreshWatches('popup')).rejects.toMatchObject({
      kind: 'permission',
      message: `Access to ${BASE} is not granted`,
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(chrome.permissions.contains).toHaveBeenCalledWith({ origins: ['http://192.168.1.10/*'] });
  });

  test('first failure keeps the badge and warns; second shows ! and logs error', async () => {
    await configure();
    respond('nope', 403);
    await expect(refreshWatches('alarm')).rejects.toMatchObject({ kind: 'auth' });
    expect(chrome.action.setBadgeText).not.toHaveBeenCalled();
    expect(hasLog('warn', 'Refresh failed (alarm), keeping previous badge: API key rejected (HTTP 403)')).toBe(true);

    await expect(refreshWatches('alarm')).rejects.toMatchObject({ kind: 'auth' });
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '!' });
    expect(chrome.action.setTitle).toHaveBeenCalledWith({
      title: 'ChangeDetection.io Monitor — API key rejected (HTTP 403)',
    });
    expect(hasLog('error', 'Refresh failed (alarm), 2 times in a row: API key rejected (HTTP 403)')).toBe(true);
    expect(await chrome.storage.session.get(FAILURE_COUNT_KEY)).toEqual({ [FAILURE_COUNT_KEY]: 2 });
  });

  test('an unexpected response format counts as a failure', async () => {
    await configure();
    respond([]);
    await expect(refreshWatches('alarm')).rejects.toThrow('Unexpected watch list format from server');
    expect(await chrome.storage.session.get(FAILURE_COUNT_KEY)).toEqual({ [FAILURE_COUNT_KEY]: 1 });
  });

  test('stores the notification baseline on success', async () => {
    await configure();
    respond(LIST);
    await refreshWatches('alarm');
    expect(await chrome.storage.local.get(NOTIFIED_KEY)).toEqual({ [NOTIFIED_KEY]: ['a'] });
  });

  test('a notification failure is logged and does not fail the refresh', async () => {
    await configure({ notificationsEnabled: true });
    await chrome.storage.local.set({ [NOTIFIED_KEY]: [] });
    chrome.notifications.create.mockRejectedValueOnce(new Error('bad icon'));
    respond(LIST);
    const result = await refreshWatches('alarm');
    expect(result.configured).toBe(true);
    expect(hasLog('warn', 'Could not show notification: bad icon')).toBe(true);
  });
});
