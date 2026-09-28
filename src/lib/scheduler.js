/**
 * @file Periodic refresh alarm.
 *
 * Chrome may drop alarms when the browser restarts, so the service worker calls
 * ensureRefreshAlarm() every time it starts instead of relying on a watchdog.
 */
import { createLogger } from './log.js';

const log = createLogger('scheduler');

export const REFRESH_ALARM = 'refreshWatches';
export const LEGACY_ALARMS = ['updateBadge', 'alarmWatchdog'];

/**
 * Create the refresh alarm unless one with the same period already exists.
 *
 * @param {number} periodMinutes - Minutes between refreshes.
 * @returns {Promise<boolean>} True when the alarm was created or replaced.
 */
export async function ensureRefreshAlarm(periodMinutes) {
  const existing = await chrome.alarms.get(REFRESH_ALARM);
  if (existing && existing.periodInMinutes === periodMinutes) {
    log.debug('Refresh alarm already scheduled every %d min', periodMinutes);
    return false;
  }
  await chrome.alarms.create(REFRESH_ALARM, { delayInMinutes: periodMinutes, periodInMinutes: periodMinutes });
  log.info('Scheduled refresh every %d min', periodMinutes);
  return true;
}

/**
 * Delete the alarms used by version 1.0.1 and earlier.
 *
 * @returns {Promise<void>} Resolves when both legacy alarms are gone.
 */
export async function clearLegacyAlarms() {
  for (const name of LEGACY_ALARMS) {
    if (await chrome.alarms.clear(name)) log.info('Removed legacy alarm %s', name);
  }
}
