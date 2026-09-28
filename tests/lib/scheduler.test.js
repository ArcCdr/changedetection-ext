import { LEGACY_ALARMS, REFRESH_ALARM, clearLegacyAlarms, ensureRefreshAlarm } from '../../src/lib/scheduler.js';
import { hasLog } from '../helpers/logs.js';

describe('ensureRefreshAlarm', () => {
  test('creates the alarm when missing and logs at info', async () => {
    expect(await ensureRefreshAlarm(5)).toBe(true);
    expect(chrome.alarms.create).toHaveBeenCalledWith(REFRESH_ALARM, { delayInMinutes: 5, periodInMinutes: 5 });
    expect(hasLog('info', '[cdio:scheduler] Scheduled refresh every 5 min')).toBe(true);
  });

  test('keeps an existing alarm with the same period', async () => {
    await chrome.alarms.create(REFRESH_ALARM, { periodInMinutes: 5 });
    chrome.alarms.create.mockClear();
    expect(await ensureRefreshAlarm(5)).toBe(false);
    expect(chrome.alarms.create).not.toHaveBeenCalled();
  });

  test('replaces an alarm with a different period', async () => {
    await chrome.alarms.create(REFRESH_ALARM, { periodInMinutes: 5 });
    expect(await ensureRefreshAlarm(15)).toBe(true);
    expect(await chrome.alarms.get(REFRESH_ALARM)).toEqual({ name: REFRESH_ALARM, delayInMinutes: 15, periodInMinutes: 15 });
  });
});

describe('clearLegacyAlarms', () => {
  test('clears updateBadge and alarmWatchdog and logs the removed ones', async () => {
    expect(LEGACY_ALARMS).toEqual(['updateBadge', 'alarmWatchdog']);
    await chrome.alarms.create('updateBadge', { periodInMinutes: 5 });
    await clearLegacyAlarms();
    expect(chrome.alarms.clear).toHaveBeenCalledWith('updateBadge');
    expect(chrome.alarms.clear).toHaveBeenCalledWith('alarmWatchdog');
    expect(hasLog('info', 'Removed legacy alarm updateBadge')).toBe(true);
    expect(hasLog('info', 'Removed legacy alarm alarmWatchdog')).toBe(false);
  });
});
