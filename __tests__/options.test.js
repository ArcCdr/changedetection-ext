/**
 * Tests for options.js functionality
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

// Mock DOM
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

describe('OptionsManager', () => {
  let OptionsManager;
  let optionsManager;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset DOM
    document.getElementById('baseURL').value = '';
    document.getElementById('apiKey').value = '';
    document.getElementById('testBtn').disabled = false;
    
    // Load the options script
    const fs = require('fs');
    const path = require('path');
    const optionsScript = fs.readFileSync(
      path.join(__dirname, '../options.js'),
      'utf8'
    );
    
    // Extract just the OptionsManager class
    const classMatch = optionsScript.match(/class OptionsManager \{[\s\S]*?(?=\n\n|\n\/\/|\nclass|\nconst|\nlet|\nvar|\ndocument\.addEventListener|$)/);
    if (classMatch) {
      eval(classMatch[0]);
      OptionsManager = eval('OptionsManager');
    }
  });

  test('should initialize DOM elements', () => {
    optionsManager = new OptionsManager();
    
    expect(optionsManager.form).toBeTruthy();
    expect(optionsManager.baseURLInput).toBeTruthy();
    expect(optionsManager.apiKeyInput).toBeTruthy();
    expect(optionsManager.testBtn).toBeTruthy();
  });

  test('should load settings from storage', async () => {
    chrome.storage.sync.get.mockImplementation((keys, callback) => {
      callback({ baseURL: 'http://localhost:5000', apiKey: 'test-key' });
    });

    optionsManager = new OptionsManager();
    await optionsManager.loadSettings();
    
    expect(optionsManager.baseURLInput.value).toBe('http://localhost:5000');
    expect(optionsManager.apiKeyInput.value).toBe('test-key');
  });

  test('should save settings to storage', async () => {
    chrome.storage.sync.set.mockImplementation((data, callback) => {
      callback();
    });

    optionsManager = new OptionsManager();
    optionsManager.baseURLInput.value = 'http://localhost:5000';
    optionsManager.apiKeyInput.value = 'test-key';
    
    await optionsManager.saveSettings();
    
    expect(chrome.storage.sync.set).toHaveBeenCalledWith(
      { baseURL: 'http://localhost:5000', apiKey: 'test-key' },
      expect.any(Function)
    );
  });

  test('should validate URL format', async () => {
    optionsManager = new OptionsManager();
    optionsManager.baseURLInput.value = 'invalid-url';
    optionsManager.apiKeyInput.value = 'test-key';
    
    const showSaveResultSpy = jest.spyOn(optionsManager, 'showSaveResult').mockImplementation(() => {});
    
    await optionsManager.saveSettings();
    
    expect(showSaveResultSpy).toHaveBeenCalledWith(
      'error',
      'Please enter a valid URL (including http:// or https://).'
    );
    expect(chrome.storage.sync.set).not.toHaveBeenCalled();
  });

  test('should require all fields', async () => {
    optionsManager = new OptionsManager();
    optionsManager.baseURLInput.value = '';
    optionsManager.apiKeyInput.value = 'test-key';
    
    const showSaveResultSpy = jest.spyOn(optionsManager, 'showSaveResult').mockImplementation(() => {});
    
    await optionsManager.saveSettings();
    
    expect(showSaveResultSpy).toHaveBeenCalledWith(
      'error',
      'Please fill in all required fields.'
    );
    expect(chrome.storage.sync.set).not.toHaveBeenCalled();
  });

  test('should test connection successfully', async () => {
    chrome.storage.sync.set.mockImplementation((data, callback) => {
      callback();
    });
    
    chrome.runtime.sendMessage.mockImplementation((message, callback) => {
      callback({ success: true });
    });

    optionsManager = new OptionsManager();
    optionsManager.baseURLInput.value = 'http://localhost:5000';
    optionsManager.apiKeyInput.value = 'test-key';
    
    const showTestResultSpy = jest.spyOn(optionsManager, 'showTestResult').mockImplementation(() => {});
    
    await optionsManager.testConnection();
    
    expect(showTestResultSpy).toHaveBeenCalledWith(
      'success',
      'Connection successful! API is working correctly.'
    );
  });

  test('should handle connection test failure', async () => {
    chrome.storage.sync.set.mockImplementation((data, callback) => {
      callback();
    });
    
    chrome.runtime.sendMessage.mockImplementation((message, callback) => {
      callback({ success: false, error: 'API key invalid' });
    });

    optionsManager = new OptionsManager();
    optionsManager.baseURLInput.value = 'http://localhost:5000';
    optionsManager.apiKeyInput.value = 'wrong-key';
    
    const showTestResultSpy = jest.spyOn(optionsManager, 'showTestResult').mockImplementation(() => {});
    
    await optionsManager.testConnection();
    
    expect(showTestResultSpy).toHaveBeenCalledWith(
      'error',
      'Connection failed: API key invalid'
    );
  });

  test('should send message to background script', async () => {
    chrome.runtime.sendMessage.mockImplementation((message, callback) => {
      callback({ success: true });
    });

    optionsManager = new OptionsManager();
    const response = await optionsManager.sendMessage({ action: 'testConnection' });
    
    expect(response.success).toBe(true);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      { action: 'testConnection' },
      expect.any(Function)
    );
  });
});