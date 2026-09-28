import {
  DEFAULT_TITLE,
  ERROR_COLOR,
  UNREAD_COLOR,
  badgeText,
  clearBadge,
  showErrorBadge,
  showUnreadBadge,
} from '../../src/lib/badge.js';

describe('badgeText', () => {
  test.each([
    [0, ''],
    [-1, ''],
    [1, '1'],
    [99, '99'],
    [100, '99+'],
  ])('%p -> %p', (count, expected) => {
    expect(badgeText(count)).toBe(expected);
  });
});

describe('badge states', () => {
  test('showUnreadBadge shows the count in red with a count tooltip', async () => {
    await showUnreadBadge(3);
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ color: UNREAD_COLOR });
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '3' });
    expect(chrome.action.setTitle).toHaveBeenCalledWith({ title: `${DEFAULT_TITLE} — 3 unread` });
  });

  test('showUnreadBadge(0) empties the badge and resets the tooltip', async () => {
    await showUnreadBadge(0);
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '' });
    expect(chrome.action.setTitle).toHaveBeenCalledWith({ title: DEFAULT_TITLE });
  });

  test('showErrorBadge shows a grey ! with the message in the tooltip', async () => {
    await showErrorBadge('API key rejected (HTTP 403)');
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ color: ERROR_COLOR });
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '!' });
    expect(chrome.action.setTitle).toHaveBeenCalledWith({ title: `${DEFAULT_TITLE} — API key rejected (HTTP 403)` });
  });

  test('clearBadge empties text and resets the tooltip', async () => {
    await clearBadge();
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '' });
    expect(chrome.action.setTitle).toHaveBeenCalledWith({ title: DEFAULT_TITLE });
  });
});
