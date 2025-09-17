// Background service worker for ChangeDetection.io extension
// Compatible with both Manifest V2 and V3

// Cross-browser compatibility for action/browserAction API
const browserAction = chrome.action || chrome.browserAction;

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
      // Try to get error details from response body
      let errorDetails = '';
      try {
        const errorBody = await response.text();
        errorDetails = errorBody ? ` - ${errorBody}` : '';
      } catch (e) {
        // Ignore error reading error body
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}${errorDetails}`);
    }

    return response.json();
  }

  async getWatches() {
    return this.makeRequest('/api/v1/watch');
  }

  async updateWatchViewed(uuid) {
    // Update last_viewed timestamp to mark as viewed
    // Per documentation: PUT with only "url" and "last_viewed" fields
    const timestamp = Math.floor(Date.now() / 1000);
    
    try {
      // Get the current watch to extract the URL
      const currentWatch = await this.makeRequest(`/api/v1/watch/${uuid}`, 'GET');
      
      // Use exactly the format specified in documentation: only url and last_viewed
      const updateData = {
        url: currentWatch.url,
        last_viewed: timestamp
      };
      
      const result = await this.makeRequest(`/api/v1/watch/${uuid}`, 'PUT', updateData);
      return result;
      
    } catch (error) {
      console.error('Failed to update watch viewed status:', error.message);
      throw error;
    }
  }
}

// Global API instance
const api = new ChangeDetectionAPI();

// Update badge based on unread watches
async function updateBadge() {
  try {
    const response = await api.getWatches();
    
    // Handle different response formats
    let watches;
    if (Array.isArray(response)) {
      watches = response;
    } else if (response && response.watches && Array.isArray(response.watches)) {
      watches = response.watches;
    } else if (response && typeof response === 'object') {
      // Object response with UUID keys - convert to array and add UUID to each watch
      watches = Object.entries(response).map(([uuid, watch]) => ({
        uuid,
        ...watch
      }));
    } else {
      watches = [];
    }
    
    const unreadCount = countUnreadWatches(watches);
    
    if (unreadCount > 0) {
      browserAction.setBadgeText({ text: '●' });
      browserAction.setBadgeBackgroundColor({ color: '#ff0000' });
    } else {
      browserAction.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Failed to update badge:', error);
    browserAction.setBadgeText({ text: '' });
  }
}

function countUnreadWatches(watches) {
  if (!watches || !Array.isArray(watches)) return 0;
  
  return watches.filter(watch => {
    // Use the "viewed" boolean field from ChangeDetection.io API
    return watch.viewed === false;
  }).length;
}

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      switch (request.action) {
        case 'getWatches': {
          const response = await api.getWatches();
          
          // Handle different response formats
          let watches;
          if (Array.isArray(response)) {
            // Direct array response
            watches = response;
          } else if (response && response.watches && Array.isArray(response.watches)) {
            // Response with watches property
            watches = response.watches;
          } else if (response && typeof response === 'object') {
            // Object response with UUID keys - convert to array and add UUID to each watch
            watches = Object.entries(response).map(([uuid, watch]) => ({
              uuid,
              ...watch
            }));
          } else {
            // Fallback to empty array
            watches = [];
          }
          
          sendResponse({ success: true, data: watches });
          break;
        }
          
        case 'markAsRead':
          await api.updateWatchViewed(request.uuid);
          await updateBadge(); // Update badge after marking as read
          sendResponse({ success: true });
          break;
          
        case 'updateWatchViewed':
          await api.updateWatchViewed(request.uuid);
          await updateBadge(); // Update badge after marking as viewed
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

// Set up periodic badge updates with configurable intervals
async function setupBadgeUpdates() {
  // Get refresh intervals from settings
  const settings = await new Promise((resolve) => {
    chrome.storage.sync.get(['refreshIntervalInitial', 'refreshIntervalRegular'], (result) => {
      resolve(result);
    });
  });
  
  const initialInterval = settings.refreshIntervalInitial || 2;
  const regularInterval = settings.refreshIntervalRegular || 5;
  
  console.log('Setting up badge updates - Initial:', initialInterval, 'min, Regular:', regularInterval, 'min');
  
  // Clear existing alarms
  chrome.alarms.clear('updateBadge');
  chrome.alarms.clear('updateBadgeFrequent');
  
  // Check frequently for the first hour, then switch to regular interval
  chrome.alarms.create('updateBadgeFrequent', { periodInMinutes: initialInterval });
  setTimeout(() => {
    chrome.alarms.clear('updateBadgeFrequent');
    chrome.alarms.create('updateBadge', { periodInMinutes: regularInterval });
    console.log('Switched to regular refresh interval:', regularInterval, 'minutes');
  }, 60 * 60 * 1000); // Switch after 1 hour
}

// Update badge periodically
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateBadge') {
    updateBadge();
  } else if (alarm.name === 'updateBadgeFrequent') {
    updateBadge();
  }
});

// Set up periodic badge updates
chrome.runtime.onStartup.addListener(async () => {
  await setupBadgeUpdates();
  updateBadge(); // Update immediately on startup
});

chrome.runtime.onInstalled.addListener(async () => {
  await setupBadgeUpdates();
  updateBadge(); // Update immediately on install
});

// Update badge when settings change
chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace === 'sync') {
    if (changes.baseURL || changes.apiKey) {
      api.isInitialized = false; // Force re-initialization
      updateBadge();
    }
    
    // If refresh intervals changed, restart the alarm system
    if (changes.refreshIntervalInitial || changes.refreshIntervalRegular) {
      console.log('Refresh intervals changed, restarting badge updates');
      await setupBadgeUpdates();
    }
  }
});