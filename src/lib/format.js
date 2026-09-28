/**
 * @file Human-friendly relative time formatting for the popup.
 */

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Format a Unix timestamp (seconds) relative to now.
 *
 * @param {number} epochSeconds - Unix time in seconds; 0, negative or non-numeric means "never".
 * @param {number} [nowMs] - Current time in milliseconds; defaults to Date.now().
 * @returns {string} 'never', 'just now', 'Nm ago', 'Nh ago', 'Nd ago' (up to 7 days) or a locale date.
 */
export function formatRelativeTime(epochSeconds, nowMs = Date.now()) {
  if (!Number.isFinite(epochSeconds) || epochSeconds <= 0) return 'never';
  const elapsed = Math.floor(nowMs / 1000) - epochSeconds;
  if (elapsed < MINUTE) return 'just now';
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m ago`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h ago`;
  if (elapsed <= 7 * DAY) return `${Math.floor(elapsed / DAY)}d ago`;
  return new Date(epochSeconds * 1000).toLocaleDateString();
}
