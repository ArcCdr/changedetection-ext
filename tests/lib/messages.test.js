import { ACTIONS, sendMessage } from '../../src/lib/messages.js';

describe('ACTIONS', () => {
  test('lists every action with its wire name and is frozen', () => {
    expect(ACTIONS).toEqual({
      GET_WATCHES: 'getWatches',
      OPEN_WATCH: 'openWatch',
      MARK_ALL_VIEWED: 'markAllViewed',
      TEST_CONNECTION: 'testConnection',
      ADD_WATCH: 'addWatch',
      RECHECK_ALL: 'recheckAll',
    });
    expect(Object.isFrozen(ACTIONS)).toBe(true);
  });
});

describe('sendMessage', () => {
  test('returns the service worker response', async () => {
    chrome.runtime.sendMessage.mockResolvedValueOnce({ success: true, data: 1 });
    expect(await sendMessage({ action: ACTIONS.GET_WATCHES })).toEqual({ success: true, data: 1 });
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ action: 'getWatches' });
  });

  test('turns a missing response into a failure', async () => {
    chrome.runtime.sendMessage.mockResolvedValueOnce(undefined);
    expect(await sendMessage({ action: 'x' })).toEqual({
      success: false,
      error: 'No response from the background service worker',
    });
  });

  test('turns a rejected send into a failure', async () => {
    chrome.runtime.sendMessage.mockRejectedValueOnce(new Error('Receiving end does not exist.'));
    expect(await sendMessage({ action: 'x' })).toEqual({ success: false, error: 'Receiving end does not exist.' });
  });
});
