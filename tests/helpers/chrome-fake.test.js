import { createChromeFake } from './chrome-fake.js';
import { allLogText, hasLog, logLines } from './logs.js';

describe('chrome fake', () => {
  test('storage round-trips values and returns only requested keys', async () => {
    await chrome.storage.sync.set({ baseURL: 'http://a', apiKey: 'k' });
    expect(await chrome.storage.sync.get(['baseURL'])).toEqual({ baseURL: 'http://a' });
    expect(await chrome.storage.sync.get('apiKey')).toEqual({ apiKey: 'k' });
    expect(await chrome.storage.sync.get(null)).toEqual({ baseURL: 'http://a', apiKey: 'k' });
  });

  test('storage returns copies, not live references', async () => {
    await chrome.storage.session.set({ list: [1] });
    const { list } = await chrome.storage.session.get('list');
    list.push(2);
    expect(await chrome.storage.session.get('list')).toEqual({ list: [1] });
  });

  test('storage remove and clear delete keys', async () => {
    await chrome.storage.local.set({ a: 1, b: 2 });
    await chrome.storage.local.remove('a');
    expect(await chrome.storage.local.get(null)).toEqual({ b: 2 });
    await chrome.storage.local.clear();
    expect(await chrome.storage.local.get(null)).toEqual({});
  });

  test('alarms keep created alarms until cleared', async () => {
    await chrome.alarms.create('x', { periodInMinutes: 5 });
    expect(await chrome.alarms.get('x')).toEqual({ name: 'x', periodInMinutes: 5 });
    expect(await chrome.alarms.clear('x')).toBe(true);
    expect(await chrome.alarms.get('x')).toBeUndefined();
  });

  test('_reset empties state but keeps event listeners', async () => {
    const fake = createChromeFake();
    const listener = jest.fn(() => 'result');
    fake.runtime.onMessage.addListener(listener);
    await fake.storage.sync.set({ a: 1 });
    fake._reset();
    expect(await fake.storage.sync.get(null)).toEqual({});
    expect(fake.runtime.onMessage.hasListener(listener)).toBe(true);
    expect(fake.runtime.onMessage.dispatch('msg')).toEqual(['result']);
    expect(listener).toHaveBeenCalledWith('msg');
  });

  test('permissions default to granted and can be overridden once', async () => {
    chrome.permissions.request.mockResolvedValueOnce(false);
    expect(await chrome.permissions.request({ origins: ['http://a/*'] })).toBe(false);
    expect(await chrome.permissions.request({ origins: ['http://a/*'] })).toBe(true);
    expect(await chrome.permissions.contains({ origins: ['http://a/*'] })).toBe(true);
  });
});

describe('log helpers', () => {
  test('logLines renders placeholders', () => {
    console.info('[cdio:x] Did %s with %d items', 'thing', 3);
    expect(logLines('info')).toEqual(['[cdio:x] Did thing with 3 items']);
    expect(hasLog('info', /Did thing with \d items/)).toBe(true);
    expect(hasLog('warn', 'Did')).toBe(false);
    expect(allLogText()).toContain('Did thing');
  });
});
