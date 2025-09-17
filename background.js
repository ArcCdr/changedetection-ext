// Background service worker for ChangeDetection.io extension

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

// Global API instance
const api = new ChangeDetectionAPI();

// Update badge based on unread watches
async function updateBadge() {
  try {
    const watches = await api.getWatches();
    const unreadCount = countUnreadWatches(watches);
    
    if (unreadCount > 0) {
      chrome.action.setBadgeText({ text: '●' });
      chrome.action.setBadgeBackgroundColor({ color: '#ff0000' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Failed to update badge:', error);
    chrome.action.setBadgeText({ text: '' });
  }
}

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

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      switch (request.action) {
        case 'getWatches': {
          const watches = await api.getWatches();
          sendResponse({ success: true, data: watches });
          break;
        }
          
        case 'markAsRead':
          await api.updateWatchViewed(request.uuid);
          await updateBadge(); // Update badge after marking as read
          sendResponse({ success: true });
          break;
          
        case 'updateBadge':
          await updateBadge();
          sendResponse({ success: true });
          break;
          
        case 'testConnection':
          await api.getWatches(); // This will throw if connection fails
          sendResponse({ success: true });
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();
  
  return true; // Keep message channel open for async response
});

// Update badge periodically
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateBadge') {
    updateBadge();
  }
});

// Set up periodic badge updates
chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create('updateBadge', { periodInMinutes: 5 });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('updateBadge', { periodInMinutes: 5 });
  updateBadge();
});

// Update badge when settings change
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && (changes.baseURL || changes.apiKey)) {
    api.isInitialized = false; // Force re-initialization
    updateBadge();
  }
});