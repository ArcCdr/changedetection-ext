// Options page script for ChangeDetection.io extension

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

    this.initializeEventListeners();
    this.loadSettings();
  }

  initializeEventListeners() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveSettings();
    });

    this.testBtn.addEventListener('click', () => {
      this.testConnection();
    });

    // Auto-hide messages after a delay
    this.baseURLInput.addEventListener('input', () => this.hideMessages());
    this.apiKeyInput.addEventListener('input', () => this.hideMessages());
  }

  async loadSettings() {
    try {
      const settings = await this.getStoredSettings();
      this.baseURLInput.value = settings.baseURL || '';
      this.apiKeyInput.value = settings.apiKey || '';
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  getStoredSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['baseURL', 'apiKey'], (result) => {
        resolve(result);
      });
    });
  }

  async saveSettings() {
    const baseURL = this.baseURLInput.value.trim();
    const apiKey = this.apiKeyInput.value.trim();

    if (!baseURL || !apiKey) {
      this.showSaveResult('error', 'Please fill in all required fields.');
      return;
    }

    // Validate URL format
    try {
      new URL(baseURL);
    } catch (error) {
      this.showSaveResult('error', 'Please enter a valid URL (including http:// or https://).');
      return;
    }

    try {
      // Save to storage
      await new Promise((resolve) => {
        chrome.storage.sync.set({ baseURL, apiKey }, resolve);
      });

      this.showSaveResult('success', 'Settings saved successfully!');
      
      // Trigger background script to update badge
      chrome.runtime.sendMessage({ action: 'updateBadge' });
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showSaveResult('error', 'Failed to save settings. Please try again.');
    }
  }

  async testConnection() {
    const baseURL = this.baseURLInput.value.trim();
    const apiKey = this.apiKeyInput.value.trim();

    if (!baseURL || !apiKey) {
      this.showTestResult('error', 'Please fill in both Server URL and API Key before testing.');
      return;
    }

    // Validate URL format
    try {
      new URL(baseURL);
    } catch (error) {
      this.showTestResult('error', 'Please enter a valid URL (including http:// or https://).');
      return;
    }

    this.testBtn.disabled = true;
    this.showTestResult('loading', 'Testing connection...');

    try {
      // Save settings temporarily for test
      await new Promise((resolve) => {
        chrome.storage.sync.set({ baseURL, apiKey }, resolve);
      });

      // Test connection through background script
      const response = await this.sendMessage({ action: 'testConnection' });

      if (response.success) {
        this.showTestResult('success', 'Connection successful! API is working correctly.');
      } else {
        this.showTestResult('error', `Connection failed: ${response.error}`);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      this.showTestResult('error', `Connection failed: ${error.message}`);
    } finally {
      this.testBtn.disabled = false;
    }
  }

  sendMessage(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        resolve(response || { success: false, error: 'No response from background script' });
      });
    });
  }

  showTestResult(type, message) {
    this.testResult.className = `test-result ${type}`;
    this.testMessage.textContent = message;
    this.testResult.style.display = 'block';
    this.saveResult.style.display = 'none';

    if (type !== 'loading') {
      setTimeout(() => {
        this.testResult.style.display = 'none';
      }, 5000);
    }
  }

  showSaveResult(type, message) {
    this.saveResult.className = `save-result ${type}`;
    this.saveMessage.textContent = message;
    this.saveResult.style.display = 'block';
    this.testResult.style.display = 'none';

    setTimeout(() => {
      this.saveResult.style.display = 'none';
    }, 5000);
  }

  hideMessages() {
    this.testResult.style.display = 'none';
    this.saveResult.style.display = 'none';
  }
}

// Initialize options page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new OptionsManager();
});