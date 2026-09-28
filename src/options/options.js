/**
 * @file Options page controller for the extension settings (server URL, API key, refresh
 * interval, notifications).
 *
 * Saving and testing first ask Chrome for access to the server origin (optional host
 * permission) from inside the click, which Chrome requires before the service worker can
 * reach servers on the local network.
 */
import { createLogger } from '../lib/log.js';
import { loadSettings, requestHostPermission, validateSettings } from '../lib/settings.js';

const log = createLogger('options');

/** Controller for options.html. */
export class OptionsManager {
  /**
   * Look up the form elements and wire their events.
   *
   * @param {Document} [doc] - Document holding options.html; defaults to the global document.
   */
  constructor(doc = document) {
    this.form = doc.getElementById('settingsForm');
    this.baseURLInput = doc.getElementById('baseURL');
    this.apiKeyInput = doc.getElementById('apiKey');
    this.refreshIntervalInput = doc.getElementById('refreshInterval');
    this.notificationsInput = doc.getElementById('notificationsEnabled');
    this.testBtn = doc.getElementById('testBtn');
    this.message = doc.getElementById('message');
    this.versionNumber = doc.getElementById('versionNumber');
    this.bindEvents();
  }

  /** Attach the form's event listeners. */
  bindEvents() {
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.save();
    });
    this.form.addEventListener('input', () => this.hideMessage());
  }

  /**
   * Show the version and fill the form with saved settings.
   *
   * @returns {Promise<void>} Resolves when the form is filled.
   */
  async init() {
    this.versionNumber.textContent = `Version ${chrome.runtime.getManifest().version}`;
    const settings = await loadSettings();
    this.baseURLInput.value = settings.baseURL;
    this.apiKeyInput.value = settings.apiKey;
    this.refreshIntervalInput.value = String(settings.refreshInterval);
    this.notificationsInput.checked = settings.notificationsEnabled;
  }

  /**
   * Read the current form values.
   *
   * @returns {{baseURL: string, apiKey: string, refreshInterval: number}} Raw values; refreshInterval converted with Number().
   */
  readForm() {
    return {
      baseURL: this.baseURLInput.value,
      apiKey: this.apiKeyInput.value,
      refreshInterval: Number(this.refreshIntervalInput.value),
    };
  }

  /**
   * Validate, request server access, then save. Called from the submit handler.
   *
   * @returns {Promise<void>} Resolves when saved or when an error is shown.
   */
  async save() {
    const check = validateSettings(this.readForm());
    if (!check.ok) {
      this.showMessage('error', check.error);
      return;
    }
    const granted = await requestHostPermission(check.value.baseURL);
    if (!granted) {
      this.showMessage('error', `Chrome needs access to ${check.value.baseURL} to reach your server.`);
      log.warn('Settings not saved: access to %s was refused', check.value.baseURL);
      return;
    }
    await chrome.storage.sync.set({ ...check.value, notificationsEnabled: this.notificationsInput.checked });
    this.baseURLInput.value = check.value.baseURL;
    this.apiKeyInput.value = check.value.apiKey;
    this.showMessage('success', 'Settings saved.');
    log.info('Settings saved: server %s, refresh every %d min', check.value.baseURL, check.value.refreshInterval);
  }

  /**
   * Show the status message.
   *
   * @param {'success'|'error'|'info'} type - Message style.
   * @param {string} text - Message text.
   */
  showMessage(type, text) {
    this.message.className = `message message-${type}`;
    this.message.textContent = text;
    this.message.hidden = false;
  }

  /** Hide the status message. */
  hideMessage() {
    this.message.hidden = true;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new OptionsManager().init().catch((error) => log.error('Options page failed to start: %s', error.message));
});
