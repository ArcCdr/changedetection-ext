/**
 * Tests for options.js functionality
 * @jest-environment jsdom
 */

// Mock chrome APIs
global.chrome = {
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  runtime: {
    sendMessage: jest.fn()
  }
};

// Mock fetch
global.fetch = jest.fn();

// Replicate the OptionsManager class for testing
class OptionsManager {
  constructor() {
    this.form = document.getElementById('settingsForm');
    this.baseURLInput = document.getElementById('baseURL');
    this.apiKeyInput = document.getElementById('apiKey');
    this.testBtn = document.getElementById('testBtn');
    this.testResult = document.getElementById('testResult');
    this.testMessage = document.getElementById('testMessage');
    this.saveResult = document.getElementById('saveResult');
    this.saveMessage = document.getElementById('saveMessage');
    this.isTestInProgress = false;
  }

  async loadSettings() {
    const settings = await this.getSettings();
    this.baseURLInput.value = settings.baseURL || '';
    this.apiKeyInput.value = settings.apiKey || '';
  }

  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['baseURL', 'apiKey'], resolve);
    });
  }

  async saveSettings() {
    const baseURL = this.baseURLInput.value.trim();
    const apiKey = this.apiKeyInput.value.trim();

    if (!baseURL || !apiKey) {
      this.showSaveResult('error', 'Please fill in all fields');
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        chrome.storage.sync.set({ baseURL, apiKey }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
      this.showSaveResult('success', 'Settings saved successfully');
    } catch (error) {
      this.showSaveResult('error', 'Failed to save settings');
    }
  }

  async testConnection() {
    if (this.isTestInProgress) return;

    const baseURL = this.baseURLInput.value.trim();
    const apiKey = this.apiKeyInput.value.trim();

    if (!baseURL || !apiKey) {
      this.showTestResult('error', 'Please fill in all fields');
      return;
    }

    this.isTestInProgress = true;
    this.testBtn.disabled = true;
    this.showTestResult('loading', 'Testing connection...');

    try {
      const url = `${baseURL.replace(/\/$/, '')}/api/v1/watch/`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.showTestResult('success', 'Connection successful!');
      } else {
        this.showTestResult('error', `Connection failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      this.showTestResult('error', `Connection failed: ${error.message}`);
    } finally {
      this.isTestInProgress = false;
      this.testBtn.disabled = false;
    }
  }

  showTestResult(type, message) {
    this.testResult.className = `result ${type}`;
    this.testMessage.textContent = message;
    this.testResult.style.display = 'block';
  }

  showSaveResult(type, message) {
    this.saveResult.className = `result ${type}`;
    this.saveMessage.textContent = message;
    this.saveResult.style.display = 'block';
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  validateForm() {
    const baseURL = this.baseURLInput.value.trim();
    const apiKey = this.apiKeyInput.value.trim();

    const isValid = Boolean(baseURL && apiKey && this.isValidUrl(baseURL));
    this.testBtn.disabled = !isValid;

    return isValid;
  }
}

describe('OptionsManager', () => {
  let optionsManager;

  beforeEach(() => {
    document.body.innerHTML = `
      <form id="settingsForm">
        <input type="url" id="baseURL" />
        <input type="password" id="apiKey" />
        <button type="button" id="testBtn"></button>
      </form>
      <div id="testResult"></div>
      <div id="testMessage"></div>
      <div id="saveResult"></div>
      <div id="saveMessage"></div>
    `;
    
    jest.clearAllMocks();
    fetch.mockClear();
    optionsManager = new OptionsManager();
  });

  test('should initialize DOM elements', () => {
    expect(optionsManager.form).toBeTruthy();
    expect(optionsManager.baseURLInput).toBeTruthy();
    expect(optionsManager.apiKeyInput).toBeTruthy();
    expect(optionsManager.testBtn).toBeTruthy();
  });

  test('should load settings from storage', async () => {
    chrome.storage.sync.get.mockImplementation((keys, callback) => {
      callback({ baseURL: 'http://localhost:5000', apiKey: 'test-key' });
    });

    await optionsManager.loadSettings();
    
    expect(optionsManager.baseURLInput.value).toBe('http://localhost:5000');
    expect(optionsManager.apiKeyInput.value).toBe('test-key');
  });

  test('should save settings to storage', async () => {
    chrome.storage.sync.set.mockImplementation((data, callback) => {
      callback();
    });

    optionsManager.baseURLInput.value = 'http://localhost:5000';
    optionsManager.apiKeyInput.value = 'test-key';
    
    await optionsManager.saveSettings();
    
    expect(chrome.storage.sync.set).toHaveBeenCalledWith(
      { baseURL: 'http://localhost:5000', apiKey: 'test-key' },
      expect.any(Function)
    );
  });

  test('should validate empty fields', async () => {
    optionsManager.baseURLInput.value = '';
    optionsManager.apiKeyInput.value = '';
    
    await optionsManager.saveSettings();
    
    expect(optionsManager.saveMessage.textContent).toBe('Please fill in all fields');
    expect(chrome.storage.sync.set).not.toHaveBeenCalled();
  });

  test('should test connection successfully', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200
    });

    optionsManager.baseURLInput.value = 'http://localhost:5000';
    optionsManager.apiKeyInput.value = 'test-key';
    
    await optionsManager.testConnection();
    
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
    expect(optionsManager.testMessage.textContent).toBe('Connection successful!');
  });

  test('should handle connection failure', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized'
    });

    optionsManager.baseURLInput.value = 'http://localhost:5000';
    optionsManager.apiKeyInput.value = 'bad-key';
    
    await optionsManager.testConnection();
    
    expect(optionsManager.testMessage.textContent).toBe('Connection failed: 401 Unauthorized');
  });

  test('should handle network error', async () => {
    fetch.mockRejectedValue(new Error('Network error'));

    optionsManager.baseURLInput.value = 'http://localhost:5000';
    optionsManager.apiKeyInput.value = 'test-key';
    
    await optionsManager.testConnection();
    
    expect(optionsManager.testMessage.textContent).toBe('Connection failed: Network error');
  });

  test('should validate URLs correctly', () => {
    expect(optionsManager.isValidUrl('http://localhost:5000')).toBe(true);
    expect(optionsManager.isValidUrl('https://example.com')).toBe(true);
    expect(optionsManager.isValidUrl('not-a-url')).toBe(false);
    expect(optionsManager.isValidUrl('')).toBe(false);
  });

  test('should validate form correctly', () => {
    // Valid form
    optionsManager.baseURLInput.value = 'http://localhost:5000';
    optionsManager.apiKeyInput.value = 'test-key';
    const validResult = optionsManager.validateForm();
    expect(validResult).toBe(true);
    
    // Invalid URL
    optionsManager.baseURLInput.value = 'not-a-url';
    optionsManager.apiKeyInput.value = 'test-key';
    const invalidUrlResult = optionsManager.validateForm();
    expect(invalidUrlResult).toBe(false);
    
    // Empty fields
    optionsManager.baseURLInput.value = '';
    optionsManager.apiKeyInput.value = '';
    const emptyResult = optionsManager.validateForm();
    expect(emptyResult).toBe(false);
  });

  test('should prevent multiple simultaneous tests', async () => {
    fetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    optionsManager.baseURLInput.value = 'http://localhost:5000';
    optionsManager.apiKeyInput.value = 'test-key';
    
    const firstTest = optionsManager.testConnection();
    const secondTest = optionsManager.testConnection();
    
    await Promise.all([firstTest, secondTest]);
    
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});