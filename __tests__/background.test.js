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
  alarms: {
    create: jest.fn(),
    onAlarm: {
      addListener: jest.fn()
    }
  }
};

// Mock fetch
global.fetch = jest.fn();

describe('ChangeDetectionAPI', () => {
  let ChangeDetectionAPI;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Load the background script (simulate loading in browser)
    const fs = require('fs');
    const path = require('path');
    const backgroundScript = fs.readFileSync(
      path.join(__dirname, '../background.js'),
      'utf8'
    );
    
    // Extract and evaluate the ChangeDetectionAPI class
    const classMatch = backgroundScript.match(/class ChangeDetectionAPI \{[\s\S]*?(?=\n\n|\n\/\/|\nclass|\n\w+\s*=|\nfunction|\nconst|\nlet|\nvar|$)/);
    if (classMatch) {
      eval(classMatch[0]);
      ChangeDetectionAPI = eval('ChangeDetectionAPI');
    }
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
  let countUnreadWatches;

  beforeEach(() => {
    // Extract the countUnreadWatches function
    const fs = require('fs');
    const path = require('path');
    const backgroundScript = fs.readFileSync(
      path.join(__dirname, '../background.js'),
      'utf8'
    );
    
    const functionMatch = backgroundScript.match(/function countUnreadWatches\(watches\) \{[\s\S]*?(?=\n\n|\n\/\/|\nfunction|\nclass|\nconst|\nlet|\nvar|$)/);
    if (functionMatch) {
      eval(functionMatch[0]);
      countUnreadWatches = eval('countUnreadWatches');
    }
  });

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