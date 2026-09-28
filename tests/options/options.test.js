import { OptionsManager } from '../../src/options/options.js';
import { loadHtml } from '../helpers/dom.js';
import { allLogText, hasLog } from '../helpers/logs.js';

const BASE = 'http://192.168.1.10:5000';

/**
 * Load options.html and create the manager.
 *
 * @returns {OptionsManager} Manager (not yet initialised).
 */
function setup() {
  loadHtml('src/options/options.html');
  return new OptionsManager(document);
}

/**
 * Fill the form fields.
 *
 * @param {{baseURL?: string, apiKey?: string, refreshInterval?: string}} values - Field values.
 */
function fill({ baseURL = BASE, apiKey = 'key', refreshInterval = '5' } = {}) {
  document.getElementById('baseURL').value = baseURL;
  document.getElementById('apiKey').value = apiKey;
  document.getElementById('refreshInterval').value = refreshInterval;
}

/**
 * Current message element state.
 *
 * @returns {{hidden: boolean, className: string, text: string}} Message state.
 */
function message() {
  const el = document.getElementById('message');
  return { hidden: el.hidden, className: el.className, text: el.textContent };
}

describe('init', () => {
  test('shows the version and fills saved settings', async () => {
    await chrome.storage.sync.set({ baseURL: `${BASE}/`, apiKey: 'k', refreshInterval: 15, notificationsEnabled: true });
    await setup().init();
    expect(document.getElementById('versionNumber').textContent).toBe('Version 0.0.0-test');
    expect(document.getElementById('baseURL').value).toBe(BASE);
    expect(document.getElementById('apiKey').value).toBe('k');
    expect(document.getElementById('refreshInterval').value).toBe('15');
    expect(document.getElementById('notificationsEnabled').checked).toBe(true);
  });
});

describe('save', () => {
  test('validates first and shows the error without asking permission', async () => {
    const options = setup();
    fill({ baseURL: 'not a url' });
    await options.save();
    expect(message()).toEqual({
      hidden: false,
      className: 'message message-error',
      text: 'Enter a valid http:// or https:// URL, e.g. http://192.168.1.10:5000',
    });
    expect(chrome.permissions.request).not.toHaveBeenCalled();
    expect(chrome.storage.sync.set).not.toHaveBeenCalled();
  });

  test('requests host permission, stores normalized values and logs without the key', async () => {
    const options = setup();
    fill({ baseURL: `${BASE}/api/v1/watch`, apiKey: ' secret-key ', refreshInterval: '10' });
    await options.save();
    expect(chrome.permissions.request).toHaveBeenCalledWith({ origins: ['http://192.168.1.10/*'] });
    expect(await chrome.storage.sync.get(null)).toEqual({
      baseURL: BASE, apiKey: 'secret-key', refreshInterval: 10, notificationsEnabled: false,
    });
    expect(document.getElementById('baseURL').value).toBe(BASE);
    expect(document.getElementById('apiKey').value).toBe('secret-key');
    expect(message()).toEqual({ hidden: false, className: 'message message-success', text: 'Settings saved.' });
    expect(hasLog('info', `[cdio:options] Settings saved: server ${BASE}, refresh every 10 min`)).toBe(true);
    expect(allLogText()).not.toContain('secret-key');
  });

  test('refused permission does not save', async () => {
    const options = setup();
    fill();
    chrome.permissions.request.mockResolvedValueOnce(false);
    await options.save();
    expect(chrome.storage.sync.set).not.toHaveBeenCalled();
    expect(message().text).toBe(`Chrome needs access to ${BASE} to reach your server.`);
    expect(hasLog('warn', `Settings not saved: access to ${BASE} was refused`)).toBe(true);
  });

  test('submitting the form saves', async () => {
    setup();
    fill();
    document.getElementById('settingsForm').dispatchEvent(new Event('submit', { cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(chrome.storage.sync.set).toHaveBeenCalled();
  });

  test('typing hides the message', () => {
    const options = setup();
    options.showMessage('success', 'x');
    document.getElementById('baseURL').dispatchEvent(new Event('input', { bubbles: true }));
    expect(message().hidden).toBe(true);
  });
});

describe('bootstrap', () => {
  test('DOMContentLoaded fills the form', async () => {
    loadHtml('src/options/options.html');
    await chrome.storage.sync.set({ baseURL: BASE, apiKey: 'k' });
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.getElementById('baseURL').value).toBe(BASE);
  });

  test('start-up failures are logged', async () => {
    loadHtml('src/options/options.html');
    chrome.storage.sync.get.mockRejectedValueOnce(new Error('storage down'));
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(hasLog('error', '[cdio:options] Options page failed to start: storage down')).toBe(true);
  });
});

describe('test connection', () => {
  test('tests the unsaved values through the service worker without storing them', async () => {
    const options = setup();
    fill({ baseURL: `${BASE}/`, apiKey: 'k2' });
    chrome.runtime.sendMessage.mockResolvedValueOnce({ success: true, data: { version: '0.50.12', watchCount: 7 } });
    await options.testConnection();
    expect(chrome.permissions.request).toHaveBeenCalledWith({ origins: ['http://192.168.1.10/*'] });
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ action: 'testConnection', baseURL: BASE, apiKey: 'k2' });
    expect(chrome.storage.sync.set).not.toHaveBeenCalled();
    expect(message()).toEqual({
      hidden: false,
      className: 'message message-success',
      text: 'Connected: changedetection.io 0.50.12, 7 watches.',
    });
    expect(document.getElementById('testBtn').disabled).toBe(false);
  });

  test('ignores the refresh interval', async () => {
    const options = setup();
    fill({ refreshInterval: '0' });
    chrome.runtime.sendMessage.mockResolvedValueOnce({ success: true, data: { version: '1', watchCount: 0 } });
    await options.testConnection();
    expect(message().className).toBe('message message-success');
  });

  test('shows validation, permission and server failures', async () => {
    const options = setup();
    fill({ apiKey: ' ' });
    await options.testConnection();
    expect(message().text).toBe('Enter your API key.');

    fill();
    chrome.permissions.request.mockResolvedValueOnce(false);
    await options.testConnection();
    expect(message().text).toBe(`Chrome needs access to ${BASE} to reach your server.`);
    expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();

    chrome.runtime.sendMessage.mockResolvedValueOnce({ success: false, error: 'API key rejected (HTTP 403)' });
    document.getElementById('testBtn').click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(message()).toEqual({
      hidden: false,
      className: 'message message-error',
      text: 'Connection failed: API key rejected (HTTP 403)',
    });
  });
});
