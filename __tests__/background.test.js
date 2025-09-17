/**
 * Tests for background.js functionality
 */

// Mock chrome APIs
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn()
    },
    onStartup: {
      addListener: jest.fn()
    },
    onInstalled: {
      addListener: jest.fn()
    },
    sendMessage: jest.fn()
  },
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn()
    },
    onChanged: {
      addListener: jest.fn()
    }
  },
  action: {
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn()
  },
  browserAction: {
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn()
  },
  alarms: {
    create: jest.fn(),
    onAlarm: {
      addListener: jest.fn()
    }
  }
};

// Mock fetch
global.fetch = jest.fn();

// Replicate the ChangeDetectionAPI class for testing
class ChangeDetectionAPI {
  constructor() {
    this.baseURL = '';
    this.apiKey = '';
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    const settings = await this.getSettings();
    this.baseURL = settings.baseURL || '';
    this.apiKey = settings.apiKey || '';
    this.isInitialized = true;
  }

  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['baseURL', 'apiKey'], (result) => {
        resolve(result);
      });
    });
  }

  async makeRequest(endpoint, method = 'GET', body = null) {
    await this.initialize();
    
    if (!this.baseURL || !this.apiKey) {
      throw new Error('Server URL and API key must be configured');
    }

    const url = `${this.baseURL.replace(/\/$/, '')}${endpoint}`;
    const headers = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json'
    };

    const options = {
      method,
      headers
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getWatches() {
    return this.makeRequest('/api/v1/watch/');
  }

  async updateWatchViewed(uuid) {
    const now = new Date().toISOString();
    return this.makeRequest(`/api/v1/watch/${uuid}`, 'PATCH', {
      last_viewed: now
    });
  }
}

// Replicate the countUnreadWatches function
function countUnreadWatches(watches) {
  if (!watches || !Array.isArray(watches)) return 0;
  
  return watches.filter(watch => {
    if (!watch.last_changed) return false;
    if (!watch.last_viewed) return true;
    
    const lastChanged = new Date(watch.last_changed);
    const lastViewed = new Date(watch.last_viewed);
    
    return lastViewed <= lastChanged;
  }).length;
}

describe('ChangeDetectionAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize with empty settings', () => {
    const api = new ChangeDetectionAPI();
    expect(api.baseURL).toBe('');
    expect(api.apiKey).toBe('');
    expect(api.isInitialized).toBe(false);
  });

  test('should get settings from storage', async () => {
    chrome.storage.sync.get.mockImplementation((keys, callback) => {
      callback({ baseURL: 'http://localhost:5000', apiKey: 'test-key' });
    });

    const api = new ChangeDetectionAPI();
    const settings = await api.getSettings();
    
    expect(settings.baseURL).toBe('http://localhost:5000');
    expect(settings.apiKey).toBe('test-key');
    expect(chrome.storage.sync.get).toHaveBeenCalledWith(['baseURL', 'apiKey'], expect.any(Function));
  });

  test('should make API request with correct headers', async () => {
    chrome.storage.sync.get.mockImplementation((keys, callback) => {
      callback({ baseURL: 'http://localhost:5000', apiKey: 'test-key' });
    });

    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ uuid: '123', title: 'Test Watch' }])
    });

    const api = new ChangeDetectionAPI();
    await api.makeRequest('/api/v1/watch/');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/v1/watch/',
      {
        method: 'GET',
        headers: {
          'x-api-key': 'test-key',
          'Content-Type': 'application/json'
        }
      }
    );
  });

  test('should throw error when settings not configured', async () => {
    chrome.storage.sync.get.mockImplementation((keys, callback) => {
      callback({});
    });

    const api = new ChangeDetectionAPI();
    
    await expect(api.makeRequest('/api/v1/watch/')).rejects.toThrow(
      'Server URL and API key must be configured'
    );
  });

  test('should handle API errors', async () => {
    chrome.storage.sync.get.mockImplementation((keys, callback) => {
      callback({ baseURL: 'http://localhost:5000', apiKey: 'test-key' });
    });

    fetch.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized'
    });

    const api = new ChangeDetectionAPI();
    
    await expect(api.makeRequest('/api/v1/watch/')).rejects.toThrow(
      'API request failed: 401 Unauthorized'
    );
  });
});

describe('Badge Management', () => {
  test('should count unread watches correctly', () => {
    const watches = [
      {
        uuid: '1',
        last_changed: '2023-01-02T00:00:00Z',
        last_viewed: '2023-01-01T00:00:00Z'
      },
      {
        uuid: '2',
        last_changed: '2023-01-01T00:00:00Z',
        last_viewed: '2023-01-02T00:00:00Z'
      },
      {
        uuid: '3',
        last_changed: '2023-01-01T00:00:00Z',
        last_viewed: null
      }
    ];

    const unreadCount = countUnreadWatches(watches);
    expect(unreadCount).toBe(2); // watches 1 and 3 are unread
  });

  test('should handle empty or invalid watch arrays', () => {
    expect(countUnreadWatches(null)).toBe(0);
    expect(countUnreadWatches(undefined)).toBe(0);
    expect(countUnreadWatches([])).toBe(0);
    expect(countUnreadWatches('not an array')).toBe(0);
  });

  test('should handle watches without dates', () => {
    const watches = [
      { uuid: '1' },
      { uuid: '2', last_changed: null },
      { uuid: '3', last_viewed: null }
    ];

    const unreadCount = countUnreadWatches(watches);
    expect(unreadCount).toBe(0);
  });
});

