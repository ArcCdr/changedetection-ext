import {
  NOTIFIED_KEY,
  SUMMARY_NOTIFICATION_ID,
  WATCH_NOTIFICATION_PREFIX,
  notificationClickTarget,
  notifyNewChanges,
} from '../../src/lib/notify.js';
import { hasLog } from '../helpers/logs.js';

/**
 * Build an unread watch.
 *
 * @param {string} uuid - UUID.
 * @param {string} title - Title.
 * @returns {object} Watch.
 */
function unread(uuid, title) {
  return { uuid, title, url: `https://${uuid}`, last_changed: 100, viewed: false };
}

describe('notifyNewChanges', () => {
  test('first run stores a baseline and never notifies', async () => {
    expect(await notifyNewChanges([unread('a', 'A')], true)).toBe(0);
    expect(await chrome.storage.local.get(NOTIFIED_KEY)).toEqual({ [NOTIFIED_KEY]: ['a'] });
    expect(chrome.notifications.create).not.toHaveBeenCalled();
  });

  test('disabled: updates the baseline without notifying', async () => {
    await chrome.storage.local.set({ [NOTIFIED_KEY]: [] });
    expect(await notifyNewChanges([unread('a', 'A')], false)).toBe(0);
    expect(chrome.notifications.create).not.toHaveBeenCalled();
    expect(await chrome.storage.local.get(NOTIFIED_KEY)).toEqual({ [NOTIFIED_KEY]: ['a'] });
  });

  test('one new change: single-watch notification with the diff id', async () => {
    await chrome.storage.local.set({ [NOTIFIED_KEY]: ['old'] });
    expect(await notifyNewChanges([unread('old', 'Old'), unread('a', 'Alpha')], true)).toBe(1);
    expect(chrome.notifications.create).toHaveBeenCalledWith(`${WATCH_NOTIFICATION_PREFIX}a`, {
      type: 'basic',
      iconUrl: 'chrome-extension://test-id/icons/icon128.png',
      title: 'Watch changed',
      message: 'Alpha',
    });
    expect(hasLog('info', '[cdio:notify] Notified 1 changed watches')).toBe(true);
  });

  test('several new changes: one summary notification listing up to 3 titles', async () => {
    await chrome.storage.local.set({ [NOTIFIED_KEY]: [] });
    const watches = ['a', 'b', 'c', 'd', 'e'].map((id) => unread(id, id.toUpperCase()));
    expect(await notifyNewChanges(watches, true)).toBe(5);
    expect(chrome.notifications.create).toHaveBeenCalledWith(SUMMARY_NOTIFICATION_ID, expect.objectContaining({
      title: '5 watches changed',
      message: 'A, B, C and 2 more',
    }));
  });

  test('read and never-changed watches are not announced', async () => {
    await chrome.storage.local.set({ [NOTIFIED_KEY]: [] });
    const watches = [{ uuid: 'r', last_changed: 5, viewed: true }, { uuid: 'n', last_changed: 0, viewed: false }];
    expect(await notifyNewChanges(watches, true)).toBe(0);
    expect(chrome.notifications.create).not.toHaveBeenCalled();
  });

  test('missing permission warns and skips', async () => {
    await chrome.storage.local.set({ [NOTIFIED_KEY]: [] });
    chrome.permissions.contains.mockResolvedValueOnce(false);
    expect(await notifyNewChanges([unread('a', 'A')], true)).toBe(0);
    expect(chrome.notifications.create).not.toHaveBeenCalled();
    expect(hasLog('warn', 'Notifications are on but Chrome permission is missing; 1 changes not shown')).toBe(true);
  });

  test('missing chrome.notifications API warns and skips', async () => {
    await chrome.storage.local.set({ [NOTIFIED_KEY]: [] });
    const api = chrome.notifications;
    delete chrome.notifications;
    try {
      expect(await notifyNewChanges([unread('a', 'A')], true)).toBe(0);
    } finally {
      chrome.notifications = api;
    }
    expect(hasLog('warn', 'permission is missing')).toBe(true);
  });
});

describe('notificationClickTarget', () => {
  const cached = [
    { uuid: 'a/b', url: 'https://site.example/page', last_changed: 100, viewed: false },
    { uuid: 'nosite', url: 'file:///tmp/x', last_changed: 50, viewed: false },
  ];

  test('single-watch id opens the cached watch\'s monitored page with its last_changed', () => {
    expect(notificationClickTarget(`${WATCH_NOTIFICATION_PREFIX}a/b`, 'http://h:5000', cached)).toEqual({
      uuid: 'a/b', url: 'https://site.example/page', lastChanged: 100,
    });
  });

  test('single-watch id without an http(s) page opens its diff page', () => {
    expect(notificationClickTarget(`${WATCH_NOTIFICATION_PREFIX}nosite`, 'http://h:5000', cached)).toEqual({
      uuid: 'nosite', url: 'http://h:5000/diff/nosite', lastChanged: 50,
    });
  });

  test('single-watch id missing from the cache opens the diff page without marking, and warns', () => {
    expect(notificationClickTarget(`${WATCH_NOTIFICATION_PREFIX}gone`, 'http://h:5000', [])).toEqual({
      uuid: 'gone', url: 'http://h:5000/diff/gone', lastChanged: 0,
    });
    expect(hasLog('warn', '[cdio:notify] Watch gone is not in the cache; opening its diff page without marking it viewed')).toBe(true);
  });

  test('summary id opens the server', () => {
    expect(notificationClickTarget(SUMMARY_NOTIFICATION_ID, 'http://h:5000', cached)).toEqual({ url: 'http://h:5000' });
  });
});
