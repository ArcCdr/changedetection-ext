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
