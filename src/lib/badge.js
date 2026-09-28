/**
 * @file Toolbar badge and tooltip: unread count, error marker, or cleared.
 */
import { createLogger } from './log.js';

const log = createLogger('badge');

export const DEFAULT_TITLE = 'ChangeDetection.io Monitor';
export const UNREAD_COLOR = '#d93025';
export const ERROR_COLOR = '#5f6368';

/**
 * Badge text for an unread count.
 *
 * @param {number} count - Number of unread watches.
 * @returns {string} '' for 0 or less, the number up to 99, '99+' above.
 */
export function badgeText(count) {
  if (count <= 0) return '';
  return count > 99 ? '99+' : String(count);
}

/**
 * Show the unread count on the toolbar icon.
 *
 * @param {number} count - Number of unread watches.
 * @returns {Promise<void>} Resolves when the badge is updated.
 */
export async function showUnreadBadge(count) {
  await chrome.action.setBadgeBackgroundColor({ color: UNREAD_COLOR });
  await chrome.action.setBadgeText({ text: badgeText(count) });
  await chrome.action.setTitle({ title: count > 0 ? `${DEFAULT_TITLE} — ${count} unread` : DEFAULT_TITLE });
  log.debug('Badge shows %d unread', count);
}

/**
 * Show a grey '!' badge with the error in the tooltip.
 *
 * @param {string} message - User-safe error message.
 * @returns {Promise<void>} Resolves when the badge is updated.
 */
export async function showErrorBadge(message) {
  await chrome.action.setBadgeBackgroundColor({ color: ERROR_COLOR });
  await chrome.action.setBadgeText({ text: '!' });
  await chrome.action.setTitle({ title: `${DEFAULT_TITLE} — ${message}` });
  log.debug('Badge shows error: %s', message);
}

/**
 * Remove the badge and reset the tooltip.
 *
 * @returns {Promise<void>} Resolves when the badge is cleared.
 */
export async function clearBadge() {
  await chrome.action.setBadgeText({ text: '' });
  await chrome.action.setTitle({ title: DEFAULT_TITLE });
  log.debug('Badge cleared');
}
