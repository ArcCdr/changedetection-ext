/**
 * @file Builds the list item for one watch in the popup.
 *
 * Uses DOM APIs only (no innerHTML), so watch titles and errors are never parsed as HTML.
 */
import { formatRelativeTime } from '../lib/format.js';
import { displayTitle, isUnread, primaryUrl, siteUrl } from '../lib/watches.js';

/**
 * Secondary text shown under a watch title.
 *
 * @param {import('../lib/watches.js').Watch} watch - The watch.
 * @param {number} [nowMs] - Current time in milliseconds; defaults to Date.now().
 * @returns {string} 'No changes yet', 'Changed 2h ago', or 'Unread · Changed 2h ago'.
 */
export function watchMeta(watch, nowMs = Date.now()) {
  const lastChanged = Number(watch.last_changed) || 0;
  if (lastChanged <= 0) return 'No changes yet';
  const changed = `Changed ${formatRelativeTime(lastChanged, nowMs)}`;
  return isUnread(watch) ? `Unread · ${changed}` : changed;
}

/**
 * Build the `<li>` for one watch.
 *
 * @param {Document} doc - Document used to create elements.
 * @param {import('../lib/watches.js').Watch} watch - The watch.
 * @param {string} baseURL - Normalized server URL.
 * @returns {HTMLLIElement} `li.watch-item` holding `a.watch-main` and, when the watch has an http(s) page, `a.watch-site`.
 */
export function buildWatchItem(doc, watch, baseURL) {
  const item = doc.createElement('li');
  item.className = 'watch-item';
  item.classList.toggle('unread', isUnread(watch));
  item.dataset.uuid = watch.uuid;

  const main = doc.createElement('a');
  main.className = 'watch-main';
  main.href = primaryUrl(baseURL, watch);
  const title = doc.createElement('span');
  title.className = 'watch-title';
  title.textContent = displayTitle(watch);
  const meta = doc.createElement('span');
  meta.className = 'watch-meta';
  meta.textContent = watchMeta(watch);
  main.append(title, meta);

  if (typeof watch.last_error === 'string' && watch.last_error) {
    item.classList.add('has-error');
    const error = doc.createElement('span');
    error.className = 'watch-error';
    error.title = watch.last_error;
    error.textContent = `⚠ ${watch.last_error}`;
    main.append(error);
  }
  item.append(main);

  const site = siteUrl(watch);
  if (site) {
    const link = doc.createElement('a');
    link.className = 'watch-site';
    link.href = site;
    link.target = '_blank';
    link.rel = 'noopener';
    link.title = 'Open monitored page';
    link.setAttribute('aria-label', `Open monitored page: ${displayTitle(watch)}`);
    link.textContent = '↗';
    item.append(link);
  }
  return item;
}
