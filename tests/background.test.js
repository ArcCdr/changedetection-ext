import {
  handleMessage,
  initialize,
  onAlarm,
  onIdleStateChanged,
  onInstalled,
  onNotificationClicked,
  onPermissionsAdded,
  onStartup,
  onStorageChanged,
  ready,
} from '../src/background.js';
import { CACHE_KEY, readWatchCache, writeWatchCache } from '../src/lib/cache.js';
import { REFRESH_ALARM } from '../src/lib/scheduler.js';
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

describe('start-up', () => {
  test('registers every lifecycle listener and schedules the refresh alarm', async () => {
    await ready;
    expect(chrome.runtime.onInstalled.hasListener(onInstalled)).toBe(true);
    expect(chrome.runtime.onStartup.hasListener(onStartup)).toBe(true);
    expect(chrome.alarms.onAlarm.hasListener(onAlarm)).toBe(true);
    expect(chrome.idle.onStateChanged.hasListener(onIdleStateChanged)).toBe(true);
    expect(chrome.storage.onChanged.hasListener(onStorageChanged)).toBe(true);
    expect(chrome.permissions.onAdded.hasListener(onPermissionsAdded)).toBe(true);
    expect(chrome.notifications.onClicked.hasListener(onNotificationClicked)).toBe(true);
  });

  test('initialize schedules the alarm from the saved interval', async () => {
    await chrome.storage.sync.set({ refreshInterval: 20 });
    await initialize();
    expect(await chrome.alarms.get(REFRESH_ALARM)).toMatchObject({ periodInMinutes: 20 });
  });

  test('initialize logs instead of throwing when scheduling fails', async () => {
    chrome.alarms.get.mockRejectedValueOnce(new Error('alarms unavailable'));
    await initialize();
    expect(hasLog('error', '[cdio:background] Could not schedule refresh: alarms unavailable')).toBe(true);
  });
});

describe('lifecycle handlers', () => {
  test('onInstalled(install) clears legacy alarms, schedules, opens options and refreshes', async () => {
    await onInstalled({ reason: 'install' });
    expect(chrome.alarms.clear).toHaveBeenCalledWith('updateBadge');
    expect(chrome.alarms.clear).toHaveBeenCalledWith('alarmWatchdog');
    expect(await chrome.alarms.get(REFRESH_ALARM)).toMatchObject({ periodInMinutes: 5 });
    expect(chrome.runtime.openOptionsPage).toHaveBeenCalled();
    expect(hasLog('info', '[cdio:background] Extension install: version 0.0.0-test')).toBe(true);
  });

  test('onInstalled(update) does not open options and swallows refresh errors', async () => {
    await configure();
    respond('x', 500);
    await onInstalled({ reason: 'update' });
    expect(chrome.runtime.openOptionsPage).not.toHaveBeenCalled();
    expect(hasLog('warn', 'Refresh failed (update)')).toBe(true);
  });

  test('onStartup schedules and refreshes', async () => {
    await configure();
    respond({});
    await onStartup();
    expect(await chrome.alarms.get(REFRESH_ALARM)).toMatchObject({ periodInMinutes: 5 });
    expect(hasLog('info', 'Refreshed watches (startup)')).toBe(true);
  });

  test('onAlarm refreshes only for the refresh alarm', async () => {
    await configure();
    respond({});
    await onAlarm({ name: 'other' });
    expect(globalThis.fetch).not.toHaveBeenCalled();
    await onAlarm({ name: REFRESH_ALARM });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  test('onIdleStateChanged refreshes only when active', async () => {
    await configure();
    respond({});
    await onIdleStateChanged('idle');
    expect(globalThis.fetch).not.toHaveBeenCalled();
    await onIdleStateChanged('active');
    expect(hasLog('info', 'Refreshed watches (wake)')).toBe(true);
  });

  test('onStorageChanged reschedules on interval change', async () => {
    await chrome.storage.sync.set({ refreshInterval: 30 });
    await onStorageChanged({ refreshInterval: { newValue: 30 } }, 'sync');
    expect(await chrome.alarms.get(REFRESH_ALARM)).toMatchObject({ periodInMinutes: 30 });
  });

  test('onStorageChanged clears the cache and refreshes on server change', async () => {
    await configure();
    await writeWatchCache([{ uuid: 'old' }], 1);
    respond({});
    await onStorageChanged({ baseURL: { newValue: BASE } }, 'sync');
    expect(chrome.storage.session.remove).toHaveBeenCalledWith(CACHE_KEY);
    expect(hasLog('info', 'Refreshed watches (settings)')).toBe(true);
  });

  test('onStorageChanged ignores other areas', async () => {
    await onStorageChanged({ baseURL: { newValue: BASE } }, 'local');
    expect(chrome.storage.session.remove).not.toHaveBeenCalled();
  });

  test('onPermissionsAdded refreshes when origins were granted', async () => {
    await configure();
    respond({});
    await onPermissionsAdded({ permissions: [], origins: ['http://192.168.1.10/*'] });
    expect(hasLog('info', 'Refreshed watches (permission)')).toBe(true);
  });

  test('onPermissionsAdded with only notifications does not refresh', async () => {
    await onPermissionsAdded({ permissions: ['notifications'], origins: [] });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe('onNotificationClicked', () => {
  const CHANGED = { uuid: 'abc', url: 'https://site.example/page', last_changed: 100, viewed: false };

  test('a single-watch notification opens the monitored page, marks the watch viewed and clears it', async () => {
    await configure();
    await writeWatchCache([CHANGED], 1);
    respond('OK');
    await onNotificationClicked('cdio-watch:abc');
    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: 'https://site.example/page', active: true });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch.mock.calls[0][0]).toBe(`${BASE}/api/v1/watch/abc`);
    expect(globalThis.fetch.mock.calls[0][1].method).toBe('PUT');
    expect((await readWatchCache()).watches[0].viewed).toBe(true);
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '' });
    expect(chrome.notifications.clear).toHaveBeenCalledWith('cdio-watch:abc');
    expect(hasLog('info', '[cdio:actions] Opened watch abc and marked it viewed')).toBe(true);
    expect(hasLog('info', '[cdio:background] Opened notification cdio-watch:abc')).toBe(true);
  });

  test('a watch missing from the cache opens its diff page without any request', async () => {
    await configure();
    await onNotificationClicked('cdio-watch:gone');
    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: `${BASE}/diff/gone`, active: true });
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(chrome.notifications.clear).toHaveBeenCalledWith('cdio-watch:gone');
    expect(hasLog('warn', 'Watch gone is not in the cache')).toBe(true);
  });

  test('a failed mark-as-viewed is logged and the notification still cleared', async () => {
    await configure();
    await writeWatchCache([CHANGED], 1);
    respond('x', 500);
    await expect(onNotificationClicked('cdio-watch:abc')).resolves.toBeUndefined();
    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: 'https://site.example/page', active: true });
    expect(chrome.notifications.clear).toHaveBeenCalledWith('cdio-watch:abc');
    expect(hasLog('warn', '[cdio:background] Could not mark watch abc viewed from notification: Server error (HTTP 500)')).toBe(true);
  });

  test('the summary notification opens the server without any request', async () => {
    await configure();
    await onNotificationClicked('cdio-changes');
    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: BASE });
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(chrome.notifications.clear).toHaveBeenCalledWith('cdio-changes');
  });

  test('does nothing but warn when not configured', async () => {
    await onNotificationClicked('cdio-changes');
    expect(chrome.tabs.create).not.toHaveBeenCalled();
    expect(hasLog('warn', '[cdio:background] Ignored notification cdio-changes: server URL is not set')).toBe(true);
  });
});
