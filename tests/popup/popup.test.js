import { PopupManager } from '../../src/popup/popup.js';
import { loadHtml } from '../helpers/dom.js';
import { hasLog } from '../helpers/logs.js';

const BASE = 'http://192.168.1.10:5000';

/**
 * Build a watch.
 *
 * @param {string} uuid - UUID.
 * @param {object} overrides - Fields to override.
 * @returns {object} Watch.
 */
function watch(uuid, overrides = {}) {
  return { uuid, title: uuid.toUpperCase(), url: `https://${uuid}.example/`, last_changed: 0, viewed: true, ...overrides };
}

/**
 * Route runtime.sendMessage by action.
 *
 * @param {object} responses - Map of action name to response object or function(request).
 */
function answer(responses) {
  chrome.runtime.sendMessage.mockImplementation(async (request) => {
    const response = responses[request.action];
    return typeof response === 'function' ? response(request) : response;
  });
}

/**
 * Load popup.html, store settings and create the manager.
 *
 * @returns {Promise<PopupManager>} Manager (not yet initialised).
 */
async function setup() {
  loadHtml('src/popup/popup.html');
  await chrome.storage.sync.set({ baseURL: BASE, apiKey: 'key' });
  return new PopupManager(document);
}

/**
 * Visible row UUIDs in display order.
 *
 * @returns {string[]} UUIDs.
 */
function rows() {
  return [...document.querySelectorAll('#watchesContainer .watch-item')].map((li) => li.dataset.uuid);
}

/**
 * Which of the four states is visible.
 *
 * @returns {string[]} Visible state element IDs.
 */
function visibleStates() {
  return ['loadingState', 'errorState', 'noConfigState', 'watchesList'].filter((id) => !document.getElementById(id).hidden);
}

describe('init and refresh', () => {
  test('not configured shows the settings prompt without messaging', async () => {
    loadHtml('src/popup/popup.html');
    await new PopupManager(document).init();
    expect(visibleStates()).toEqual(['noConfigState']);
    expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
  });

  test('configured: renders sorted watches, links the title, shows status', async () => {
    const popup = await setup();
    answer({
      getWatches: {
        success: true,
        data: { watches: [watch('a'), watch('b', { last_changed: 100, viewed: false })], fetchedAt: Date.now() },
      },
    });
    await popup.init();
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ action: 'getWatches' });
    expect(visibleStates()).toEqual(['watchesList']);
    expect(rows()).toEqual(['b', 'a']);
    expect(document.getElementById('titleLink').getAttribute('href')).toBe(BASE);
    expect(document.getElementById('statusLine').textContent).toBe('Updated just now');
  });

  test('empty list shows the empty message', async () => {
    const popup = await setup();
    answer({ getWatches: { success: true, data: { watches: [], fetchedAt: Date.now() } } });
    await popup.init();
    expect(document.getElementById('emptyMessage').hidden).toBe(false);
    expect(document.getElementById('emptyMessage').textContent).toBe('No watches yet.');
  });

  test('failure shows the error state and logs a warning', async () => {
    const popup = await setup();
    answer({ getWatches: { success: false, error: 'Cannot reach http://x', errorKind: 'network' } });
    await popup.init();
    expect(visibleStates()).toEqual(['errorState']);
    expect(document.getElementById('errorMessage').textContent).toBe('Cannot reach http://x');
    expect(document.getElementById('grantBtn').hidden).toBe(true);
    expect(document.getElementById('statusLine').textContent).toBe('');
    expect(hasLog('warn', '[cdio:popup] Could not load watches: Cannot reach http://x')).toBe(true);
  });

  test('a permission failure reveals the Grant access button', async () => {
    const popup = await setup();
    answer({ getWatches: { success: false, error: 'Access to x is not granted', errorKind: 'permission' } });
    await popup.init();
    expect(visibleStates()).toEqual(['errorState']);
    expect(document.getElementById('grantBtn').hidden).toBe(false);
  });

  test('refresh and retry buttons refetch; settings buttons open options', async () => {
    const popup = await setup();
    answer({ getWatches: { success: true, data: { watches: [], fetchedAt: Date.now() } } });
    await popup.init();
    chrome.runtime.sendMessage.mockClear();
    document.getElementById('refreshBtn').click();
    document.getElementById('retryBtn').click();
    expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(2);
    document.getElementById('settingsBtn').click();
    document.getElementById('configureBtn').click();
    expect(chrome.runtime.openOptionsPage).toHaveBeenCalledTimes(2);
  });
});

describe('bootstrap', () => {
  test('DOMContentLoaded starts the popup', async () => {
    loadHtml('src/popup/popup.html');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.getElementById('noConfigState').hidden).toBe(false);
  });

  test('start-up failures are logged', async () => {
    loadHtml('src/popup/popup.html');
    chrome.storage.sync.get.mockRejectedValueOnce(new Error('storage down'));
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(hasLog('error', '[cdio:popup] Popup failed to start: storage down')).toBe(true);
  });
});

describe('opening watches', () => {
  /**
   * Initialise with one unread and one never-changed watch.
   *
   * @returns {Promise<PopupManager>} Manager.
   */
  async function ready() {
    const popup = await setup();
    answer({
      getWatches: {
        success: true,
        data: { watches: [watch('u', { last_changed: 100, viewed: false }), watch('n')], fetchedAt: Date.now() },
      },
      openWatch: { success: true },
    });
    await popup.init();
    chrome.runtime.sendMessage.mockClear();
    return popup;
  }

  test('click opens the diff page in the foreground and marks the row read', async () => {
    const popup = await ready();
    const main = document.querySelector('[data-uuid="u"] .watch-main');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    main.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      action: 'openWatch', uuid: 'u', url: `${BASE}/diff/u`, lastChanged: 100, background: false,
    });
    expect(document.querySelector('[data-uuid="u"]').classList.contains('unread')).toBe(false);
    expect(popup.watches.find((w) => w.uuid === 'u').viewed).toBe(true);
  });

  test('ctrl/cmd-click and middle-click open in the background', async () => {
    await ready();
    const main = () => document.querySelector('[data-uuid="n"] .watch-main');
    main().dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }));
    main().dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, metaKey: true }));
    main().dispatchEvent(new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 1 }));
    const calls = chrome.runtime.sendMessage.mock.calls.map(([request]) => request);
    expect(calls).toHaveLength(3);
    expect(calls.every((request) => request.background === true && request.url === 'https://n.example/')).toBe(true);
  });

  test('right-click (auxclick button 2) and clicks outside rows are ignored', async () => {
    await ready();
    document.querySelector('[data-uuid="n"] .watch-main')
      .dispatchEvent(new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 2 }));
    document.getElementById('watchesContainer').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
  });

  test('a failed openWatch is reported in the status line', async () => {
    const popup = await ready();
    answer({ openWatch: { success: false, error: 'Server error (HTTP 500)' } });
    await popup.openWatch(popup.watches[0], false);
    expect(document.getElementById('statusLine').textContent).toBe('Could not mark as viewed: Server error (HTTP 500)');
  });
});

describe('mark all viewed', () => {
  test('the button is enabled only while something is unread', async () => {
    const popup = await setup();
    answer({ getWatches: { success: true, data: { watches: [watch('a')], fetchedAt: Date.now() } } });
    await popup.init();
    expect(document.getElementById('markAllBtn').disabled).toBe(true);
    answer({ getWatches: { success: true, data: { watches: [watch('b', { last_changed: 5, viewed: false })], fetchedAt: Date.now() } } });
    await popup.refresh();
    expect(document.getElementById('markAllBtn').disabled).toBe(false);
  });

  test('sends every unread watch once and marks the successes', async () => {
    const popup = await setup();
    const watches = [watch('a', { last_changed: 10, viewed: false }), watch('b', { last_changed: 20, viewed: false }), watch('c')];
    answer({
      getWatches: { success: true, data: { watches, fetchedAt: Date.now() } },
      markAllViewed: { success: true, data: { markedUuids: ['a'], failed: 1 } },
    });
    await popup.init();
    chrome.runtime.sendMessage.mockClear();
    document.getElementById('markAllBtn').click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(1);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      action: 'markAllViewed',
      items: [{ uuid: 'a', lastChanged: 10 }, { uuid: 'b', lastChanged: 20 }],
    });
    expect(document.querySelector('[data-uuid="a"]').classList.contains('unread')).toBe(false);
    expect(document.querySelector('[data-uuid="b"]').classList.contains('unread')).toBe(true);
    expect(document.getElementById('statusLine').textContent).toBe('Marked 1 of 2 viewed; 1 failed');
  });

  test('all succeed', async () => {
    const popup = await setup();
    answer({
      getWatches: { success: true, data: { watches: [watch('a', { last_changed: 10, viewed: false })], fetchedAt: Date.now() } },
      markAllViewed: { success: true, data: { markedUuids: ['a'], failed: 0 } },
    });
    await popup.init();
    await popup.markAllViewed();
    expect(document.getElementById('statusLine').textContent).toBe('Marked 1 viewed');
    expect(document.getElementById('markAllBtn').disabled).toBe(true);
  });

  test('nothing unread sends nothing; failure is reported', async () => {
    const popup = await setup();
    answer({ getWatches: { success: true, data: { watches: [watch('a')], fetchedAt: Date.now() } } });
    await popup.init();
    chrome.runtime.sendMessage.mockClear();
    await popup.markAllViewed();
    expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();

    popup.watches = [watch('x', { last_changed: 5, viewed: false })];
    answer({ markAllViewed: { success: false, error: 'boom' } });
    await popup.markAllViewed();
    expect(document.getElementById('statusLine').textContent).toBe('Could not mark watches viewed: boom');
  });
});
