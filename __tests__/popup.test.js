/**
 * Tests for popup.js functionality
 */

// Mock chrome APIs
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    openOptionsPage: jest.fn()
  },
  storage: {
    sync: {
      get: jest.fn()
    }
  },
  tabs: {
    create: jest.fn()
  }
};

// Mock DOM
document.body.innerHTML = `
  <div id="watchesContainer"></div>
  <div id="loadingState"></div>
  <div id="errorState"></div>
  <div id="noConfigState"></div>
  <div id="watchesList"></div>
  <div id="errorMessage"></div>
  <button id="settingsBtn"></button>
  <button id="configureBtn"></button>
  <button id="retryBtn"></button>
  <button id="refreshBtn"></button>
`;

describe('PopupManager', () => {
  let PopupManager;
  let popupManager;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Load the popup script
    const fs = require('fs');
    const path = require('path');
    const popupScript = fs.readFileSync(
      path.join(__dirname, '../popup.js'),
      'utf8'
    );
    
    // Extract just the PopupManager class
    const classMatch = popupScript.match(/class PopupManager \{[\s\S]*?(?=\n\n|\n\/\/|\nclass|\nconst|\nlet|\nvar|\ndocument\.addEventListener|$)/);
    if (classMatch) {
      eval(classMatch[0]);
      PopupManager = eval('PopupManager');
    }
  });

  test('should initialize DOM elements', () => {
    popupManager = new PopupManager();
    
    expect(popupManager.watchesContainer).toBeTruthy();
    expect(popupManager.loadingState).toBeTruthy();
    expect(popupManager.errorState).toBeTruthy();
    expect(popupManager.noConfigState).toBeTruthy();
    expect(popupManager.watchesList).toBeTruthy();
  });

  test('should show correct state', () => {
    popupManager = new PopupManager();
    
    popupManager.showState('loading');
    expect(popupManager.loadingState.style.display).toBe('flex');
    expect(popupManager.errorState.style.display).toBe('none');
    
    popupManager.showState('error');
    expect(popupManager.loadingState.style.display).toBe('none');
    expect(popupManager.errorState.style.display).toBe('block');
  });

  test('should get settings from storage', async () => {
    chrome.storage.sync.get.mockImplementation((keys, callback) => {
      callback({ baseURL: 'http://localhost:5000', apiKey: 'test-key' });
    });

    popupManager = new PopupManager();
    const settings = await popupManager.getSettings();
    
    expect(settings.baseURL).toBe('http://localhost:5000');
    expect(settings.apiKey).toBe('test-key');
  });

  test('should send message to background script', async () => {
    chrome.runtime.sendMessage.mockImplementation((message, callback) => {
      callback({ success: true, data: [] });
    });

    popupManager = new PopupManager();
    const response = await popupManager.sendMessage({ action: 'getWatches' });
    
    expect(response.success).toBe(true);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      { action: 'getWatches' },
      expect.any(Function)
    );
  });

  test('should determine if watch is unread', () => {
    popupManager = new PopupManager();
    
    // Unread: last_viewed is before last_changed
    const unreadWatch = {
      last_changed: '2023-01-02T00:00:00Z',
      last_viewed: '2023-01-01T00:00:00Z'
    };
    expect(popupManager.isWatchUnread(unreadWatch)).toBe(true);
    
    // Read: last_viewed is after last_changed
    const readWatch = {
      last_changed: '2023-01-01T00:00:00Z',
      last_viewed: '2023-01-02T00:00:00Z'
    };
    expect(popupManager.isWatchUnread(readWatch)).toBe(false);
    
    // Unread: no last_viewed
    const neverViewedWatch = {
      last_changed: '2023-01-01T00:00:00Z',
      last_viewed: null
    };
    expect(popupManager.isWatchUnread(neverViewedWatch)).toBe(true);
    
    // Neither: no last_changed
    const noChangeWatch = {
      last_changed: null,
      last_viewed: '2023-01-01T00:00:00Z'
    };
    expect(popupManager.isWatchUnread(noChangeWatch)).toBe(false);
  });

  test('should escape HTML properly', () => {
    popupManager = new PopupManager();
    
    const htmlString = '<script>alert("xss")</script>';
    const escaped = popupManager.escapeHtml(htmlString);
    
    expect(escaped).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
  });

  test('should format dates correctly', () => {
    popupManager = new PopupManager();
    
    // Test recent date (hours ago)
    const hoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(popupManager.formatDate(hoursAgo)).toBe('2h ago');
    
    // Test days ago
    const daysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(popupManager.formatDate(daysAgo)).toBe('3d ago');
    
    // Test null/undefined
    expect(popupManager.formatDate(null)).toBe('Never');
    expect(popupManager.formatDate(undefined)).toBe('Never');
    
    // Test invalid date
    expect(popupManager.formatDate('invalid')).toBe('Unknown');
  });

  test('should create watch element with correct classes', () => {
    popupManager = new PopupManager();
    
    const watch = {
      uuid: '123',
      title: 'Test Watch',
      url: 'https://example.com',
      last_changed: '2023-01-02T00:00:00Z',
      last_viewed: '2023-01-01T00:00:00Z' // Unread
    };
    
    const element = popupManager.createWatchElement(watch);
    
    expect(element.className).toContain('watch-item');
    expect(element.className).toContain('unread');
    expect(element.innerHTML).toContain('Test Watch');
    expect(element.innerHTML).toContain('https://example.com');
    expect(element.innerHTML).toContain('Unread');
  });
});