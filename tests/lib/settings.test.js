import {
  DEFAULT_REFRESH_MINUTES,
  SETTINGS_KEYS,
  hasHostPermission,
  hostPermissionPattern,
  isConfigured,
  isValidRefreshInterval,
  loadSettings,
  normalizeBaseUrl,
  requestHostPermission,
  validateConnection,
  validateSettings,
} from '../../src/lib/settings.js';

describe('normalizeBaseUrl', () => {
  test.each([
    ['http://192.168.1.10:5000', 'http://192.168.1.10:5000'],
    ['  http://192.168.1.10:5000/  ', 'http://192.168.1.10:5000'],
    ['https://cd.example.com//', 'https://cd.example.com'],
    ['http://host:5000/api/v1/watch/', 'http://host:5000'],
    ['http://host/changedetection/api', 'http://host/changedetection'],
    ['http://host/apiary', 'http://host/apiary'],
    ['http://user:pass@host:5000/?q=1#x', 'http://host:5000'],
  ])('normalizes %p to %p', (input, expected) => {
    expect(normalizeBaseUrl(input)).toBe(expected);
  });

  test.each([[''], ['not a url'], ['javascript:alert(1)'], ['ftp://host'], [undefined], [null]])(
    'returns null for %p',
    (input) => {
      expect(normalizeBaseUrl(input)).toBeNull();
    },
  );
});

describe('isValidRefreshInterval', () => {
  test.each([
    [1, true],
    [1440, true],
    [5, true],
    [0, false],
    [1441, false],
    [2.5, false],
    [Number.NaN, false],
    ['5', false],
  ])('%p -> %p', (value, expected) => {
    expect(isValidRefreshInterval(value)).toBe(expected);
  });
});

describe('validateConnection', () => {
  test('requires a server URL', () => {
    expect(validateConnection({ baseURL: ' ', apiKey: 'k' })).toEqual({ ok: false, error: 'Enter your server URL.' });
  });

  test('rejects non-http(s) URLs', () => {
    expect(validateConnection({ baseURL: 'javascript:alert(1)', apiKey: 'k' })).toEqual({
      ok: false,
      error: 'Enter a valid http:// or https:// URL, e.g. http://192.168.1.10:5000',
    });
  });

  test('requires an API key', () => {
    expect(validateConnection({ baseURL: 'http://h', apiKey: '  ' })).toEqual({ ok: false, error: 'Enter your API key.' });
  });

  test('returns normalized, trimmed values', () => {
    expect(validateConnection({ baseURL: 'http://h:5000/', apiKey: ' key ' })).toEqual({
      ok: true,
      value: { baseURL: 'http://h:5000', apiKey: 'key' },
    });
  });
});

describe('validateSettings', () => {
  test('passes connection errors through', () => {
    expect(validateSettings({ baseURL: '', apiKey: 'k', refreshInterval: 5 }).ok).toBe(false);
  });

  test('rejects an out-of-range interval', () => {
    expect(validateSettings({ baseURL: 'http://h', apiKey: 'k', refreshInterval: 0 })).toEqual({
      ok: false,
      error: 'Refresh interval must be a whole number from 1 to 1440 minutes.',
    });
  });

  test('returns all normalized values', () => {
    expect(validateSettings({ baseURL: 'http://h/', apiKey: 'k', refreshInterval: 15 })).toEqual({
      ok: true,
      value: { baseURL: 'http://h', apiKey: 'k', refreshInterval: 15 },
    });
  });
});

describe('hostPermissionPattern', () => {
  test('drops port and path', () => {
    expect(hostPermissionPattern('http://192.168.1.10:5000/cd')).toBe('http://192.168.1.10/*');
    expect(hostPermissionPattern('https://cd.example.com')).toBe('https://cd.example.com/*');
  });
});

describe('loadSettings / isConfigured', () => {
  test('applies defaults when nothing is stored', async () => {
    expect(await loadSettings()).toEqual({
      baseURL: '',
      apiKey: '',
      refreshInterval: DEFAULT_REFRESH_MINUTES,
      notificationsEnabled: false,
    });
    expect(chrome.storage.sync.get).toHaveBeenCalledWith(SETTINGS_KEYS);
  });

  test('normalizes a legacy stored URL and keeps valid values', async () => {
    await chrome.storage.sync.set({
      baseURL: 'http://192.168.1.10:5000/',
      apiKey: 'key',
      refreshInterval: 10,
      notificationsEnabled: true,
    });
    const settings = await loadSettings();
    expect(settings).toEqual({
      baseURL: 'http://192.168.1.10:5000',
      apiKey: 'key',
      refreshInterval: 10,
      notificationsEnabled: true,
    });
    expect(isConfigured(settings)).toBe(true);
  });

  test('falls back for invalid stored values', async () => {
    await chrome.storage.sync.set({ baseURL: 'javascript:x', apiKey: 42, refreshInterval: 0, notificationsEnabled: 'yes' });
    const settings = await loadSettings();
    expect(settings).toEqual({ baseURL: '', apiKey: '', refreshInterval: 5, notificationsEnabled: false });
    expect(isConfigured(settings)).toBe(false);
  });

  test('isConfigured needs both URL and key', () => {
    expect(isConfigured({ baseURL: 'http://h', apiKey: '' })).toBe(false);
    expect(isConfigured({ baseURL: '', apiKey: 'k' })).toBe(false);
  });
});

describe('host permission helpers', () => {
  test('hasHostPermission asks chrome.permissions.contains for the origin pattern', async () => {
    chrome.permissions.contains.mockResolvedValueOnce(false);
    expect(await hasHostPermission('http://192.168.1.10:5000')).toBe(false);
    expect(chrome.permissions.contains).toHaveBeenCalledWith({ origins: ['http://192.168.1.10/*'] });
  });

  test('requestHostPermission calls chrome.permissions.request synchronously', async () => {
    const pending = requestHostPermission('http://192.168.1.10:5000');
    expect(chrome.permissions.request).toHaveBeenCalledWith({ origins: ['http://192.168.1.10/*'] });
    expect(await pending).toBe(true);
  });
});
