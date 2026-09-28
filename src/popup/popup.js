/**
 * @file Popup page controller: lists the user's watches and runs the actions offered on them.
 *
 * All server work goes through the service worker (lib/messages.js), so it completes even
 * when the popup closes.
 */
import { readWatchCache } from '../lib/cache.js';
import { formatRelativeTime } from '../lib/format.js';
import { createLogger } from '../lib/log.js';
import { ACTIONS, sendMessage } from '../lib/messages.js';
import { isConfigured, loadSettings, requestHostPermission } from '../lib/settings.js';
import { isUnread, primaryUrl, sortWatches } from '../lib/watches.js';
import { buildWatchItem } from './watch-item.js';

const log = createLogger('popup');

const ELEMENT_IDS = [
  'titleLink', 'refreshBtn', 'settingsBtn', 'statusLine', 'loadingState', 'errorState', 'errorMessage',
  'grantBtn', 'retryBtn', 'noConfigState', 'configureBtn', 'watchesList', 'pageBar', 'watchPageBtn',
  'pageStatus', 'filterBar', 'filterInput', 'watchesContainer', 'emptyMessage', 'markAllBtn', 'recheckAllBtn',
];

const STATE_ELEMENTS = { loading: 'loadingState', error: 'errorState', noConfig: 'noConfigState', watches: 'watchesList' };

/** Controller for popup.html. */
export class PopupManager {
  /**
   * Look up the popup elements and wire their events.
   *
   * @param {Document} [doc] - Document holding popup.html; defaults to the global document.
   */
  constructor(doc = document) {
    this.doc = doc;
    this.el = Object.fromEntries(ELEMENT_IDS.map((id) => [id, doc.getElementById(id)]));
    this.settings = null;
    this.watches = [];
    this.fetchedAt = 0;
    this.bindEvents();
  }

  /** Attach event listeners to buttons, the filter and the list. */
  bindEvents() {
    const openSettings = () => chrome.runtime.openOptionsPage();
    this.el.settingsBtn.addEventListener('click', openSettings);
    this.el.configureBtn.addEventListener('click', openSettings);
    this.el.refreshBtn.addEventListener('click', () => this.refresh());
    this.el.retryBtn.addEventListener('click', () => this.refresh());
    this.el.watchesContainer.addEventListener('click', (event) => this.onListClick(event));
    this.el.watchesContainer.addEventListener('auxclick', (event) => this.onListClick(event));
    this.el.markAllBtn.addEventListener('click', () => this.markAllViewed());
    this.el.grantBtn.addEventListener('click', () => this.grantAccess());
  }

  /**
   * Load settings, show cached watches immediately, then refresh from the server.
   *
   * @returns {Promise<void>} Resolves when the first refresh finished.
   */
  async init() {
    this.settings = await loadSettings();
    if (!isConfigured(this.settings)) {
      this.showState('noConfig');
      return;
    }
    this.el.titleLink.href = this.settings.baseURL;
    const cache = await readWatchCache();
    if (cache) {
      this.watches = cache.watches;
      this.fetchedAt = cache.fetchedAt;
      this.render();
      this.showState('watches');
    } else {
      this.showState('loading');
    }
    await this.refresh();
  }

  /**
   * Show exactly one of the four page states.
   *
   * @param {'loading'|'error'|'noConfig'|'watches'} state - State to show.
   */
  showState(state) {
    for (const [name, id] of Object.entries(STATE_ELEMENTS)) this.el[id].hidden = name !== state;
  }

  /**
   * Set the one-line status text under the header.
   *
   * @param {string} text - Status text; '' clears it.
   */
  setStatus(text) {
    this.el.statusLine.textContent = text;
  }

  /**
   * Show the error state.
   *
   * @param {string} message - User-safe error message.
   * @param {string} [kind] - ApiError kind; 'permission' reveals the Grant access button.
   */
  showError(message, kind) {
    this.el.errorMessage.textContent = message;
    this.el.grantBtn.hidden = kind !== 'permission';
    this.setStatus('');
    this.showState('error');
  }

  /**
   * Fetch watches through the service worker and render them.
   *
   * @returns {Promise<void>} Resolves when the list or an error is shown.
   */
  async refresh() {
    this.setStatus('Refreshing…');
    const response = await sendMessage({ action: ACTIONS.GET_WATCHES });
    if (response.success) {
      this.watches = response.data.watches;
      this.fetchedAt = response.data.fetchedAt;
      this.render();
      this.showState('watches');
      this.setStatus(`Updated ${formatRelativeTime(Math.floor(this.fetchedAt / 1000))}`);
      return;
    }
    log.warn('Could not load watches: %s', response.error);
    if (response.errorKind !== 'permission' && !this.el.watchesList.hidden) {
      const age = formatRelativeTime(Math.floor(this.fetchedAt / 1000));
      this.setStatus(`Update failed: ${response.error} (showing results from ${age})`);
      return;
    }
    this.showError(response.error, response.errorKind);
  }

  /** Rebuild the list from this.watches in display order. */
  render() {
    const visible = sortWatches(this.watches);
    this.el.watchesContainer.replaceChildren(
      ...visible.map((watch) => buildWatchItem(this.doc, watch, this.settings.baseURL)),
    );
    this.el.emptyMessage.hidden = visible.length > 0;
    this.el.emptyMessage.textContent = 'No watches yet.';
    this.el.markAllBtn.disabled = !this.watches.some(isUnread);
  }

  /**
   * Handle click and middle-click on a watch row.
   *
   * @param {MouseEvent} event - click or auxclick event from the list.
   * @returns {Promise<void>|undefined} The openWatch promise when a row was activated.
   */
  onListClick(event) {
    const main = event.target.closest('.watch-main');
    if (!main) return undefined;
    if (event.type === 'auxclick' && event.button !== 1) return undefined;
    event.preventDefault();
    const watch = this.watches.find((candidate) => candidate.uuid === main.closest('.watch-item').dataset.uuid);
    if (!watch) return undefined;
    const background = event.type === 'auxclick' || event.ctrlKey || event.metaKey;
    return this.openWatch(watch, background);
  }

  /**
   * Open a watch (diff page when changed) and mark it viewed.
   *
   * @param {import('../lib/watches.js').Watch} watch - The watch.
   * @param {boolean} background - Open the tab in the background and keep the popup open.
   * @returns {Promise<void>} Resolves when the service worker answered.
   */
  async openWatch(watch, background) {
    const request = {
      action: ACTIONS.OPEN_WATCH,
      uuid: watch.uuid,
      url: primaryUrl(this.settings.baseURL, watch),
      lastChanged: Number(watch.last_changed) || 0,
      background,
    };
    if (isUnread(watch)) {
      watch.viewed = true;
      this.render();
    }
    const response = await sendMessage(request);
    if (!response.success) this.setStatus(`Could not mark as viewed: ${response.error}`);
  }

  /**
   * Mark every unread watch viewed.
   *
   * @returns {Promise<void>} Resolves when the service worker answered.
   */
  async markAllViewed() {
    const unread = this.watches.filter(isUnread);
    if (unread.length === 0) return;
    this.el.markAllBtn.disabled = true;
    const items = unread.map((watch) => ({ uuid: watch.uuid, lastChanged: Number(watch.last_changed) || 0 }));
    const response = await sendMessage({ action: ACTIONS.MARK_ALL_VIEWED, items });
    if (!response.success) {
      this.setStatus(`Could not mark watches viewed: ${response.error}`);
      this.render();
      return;
    }
    const { markedUuids, failed } = response.data;
    for (const watch of this.watches) if (markedUuids.includes(watch.uuid)) watch.viewed = true;
    this.render();
    this.setStatus(
      failed > 0
        ? `Marked ${markedUuids.length} of ${items.length} viewed; ${failed} failed`
        : `Marked ${markedUuids.length} viewed`,
    );
  }

  /**
   * Request host permission for the server, then retry. Called from a click handler.
   *
   * @returns {Promise<void>} Resolves when access was refused or the refresh finished.
   */
  async grantAccess() {
    const granted = await requestHostPermission(this.settings.baseURL);
    if (!granted) {
      this.setStatus('Access not granted. The extension cannot reach your server without it.');
      return;
    }
    this.showState('loading');
    await this.refresh();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PopupManager().init().catch((error) => log.error('Popup failed to start: %s', error.message));
});
