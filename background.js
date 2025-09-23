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
    console.log('Updating badge...');
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
    console.log(`Found ${watches.length} watches, ${unreadCount} unread`);
    
    if (unreadCount > 0) {
      await browserAction.setBadgeText({ text: '●' });
      await browserAction.setBadgeBackgroundColor({ color: '#ff0000' });
    } else {
      await browserAction.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Failed to update badge:', error);
    // Don't clear badge on error - keep previous state
    // Only clear if we explicitly know there are no unread items
  }
}

function countUnreadWatches(watches) {
  if (!watches || !Array.isArray(watches)) return 0;
  
  return watches.filter(watch => {
    // Check both "viewed" boolean field and compare last_viewed vs last_changed timestamps
    // This provides more robust unread detection
    
    // Primary check: use "viewed" boolean field if available
    if (typeof watch.viewed === 'boolean') {
      return watch.viewed === false;
    }
    
    // Fallback: compare timestamps - if last_viewed is less than last_changed, it's unread
    // Handle cases where last_changed might be 0 (never changed) or missing
    const lastChanged = watch.last_changed || 0;
    const lastViewed = watch.last_viewed || 0;
    
    // If never changed, consider it read
    if (lastChanged === 0) return false;
    
    // If last_viewed is 0 or less than last_changed, it's unread
    return lastViewed === 0 || lastViewed < lastChanged;
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

// Set up periodic badge updates with configurable interval
async function setupBadgeUpdates() {
  // Get refresh interval from settings
  const settings = await new Promise((resolve) => {
    chrome.storage.sync.get(['refreshInterval'], (result) => {
      resolve(result);
    });
  });
  
  let interval = settings.refreshInterval;
  interval = interval || 5;
  console.log('Setting up badge updates - Interval:', interval, 'min');
  
  // Clear existing alarms to avoid duplicates
  await chrome.alarms.clear('updateBadge');
  
  // Set up the update alarm with when parameter to ensure immediate scheduling
  chrome.alarms.create('updateBadge', { 
    periodInMinutes: interval,
    when: Date.now() + (interval * 60 * 1000) // First alarm after interval
  });
  
  // Verify alarm was created
  const alarms = await chrome.alarms.getAll();
  const updateAlarm = alarms.find(alarm => alarm.name === 'updateBadge');
  if (updateAlarm) {
    console.log('Badge update alarm created successfully:', updateAlarm);
  } else {
    console.error('Failed to create badge update alarm');
  }
}

// Update badge periodically and handle alarm watchdog
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'updateBadge') {
    console.log('Badge update alarm triggered');
    await updateBadge();
    
    // Verify the alarm is still scheduled for next time
    // Chrome can sometimes clear alarms during extended idle periods
    const alarms = await chrome.alarms.getAll();
    const updateAlarm = alarms.find(a => a.name === 'updateBadge');
    if (!updateAlarm) {
      console.log('Badge alarm was cleared, recreating...');
      await setupBadgeUpdates();
    }
  } else if (alarm.name === 'alarmWatchdog') {
    console.log('Alarm watchdog triggered');
    const alarms = await chrome.alarms.getAll();
    const updateAlarm = alarms.find(a => a.name === 'updateBadge');
    if (!updateAlarm) {
      console.log('Watchdog detected missing badge alarm, recreating...');
      await setupBadgeUpdates();
      await updateBadge(); // Immediate update
    }
  }
});

// Additional safeguard: Check for missing alarms periodically
chrome.alarms.create('alarmWatchdog', { periodInMinutes: 60 }); // Check every hour

// Set up periodic badge updates
chrome.runtime.onStartup.addListener(async () => {
  console.log('Extension startup - initializing badge updates');
  await setupBadgeUpdates();
  await updateBadge(); // Update immediately on startup
});

chrome.runtime.onInstalled.addListener(async () => {
  console.log('Extension installed/updated - initializing badge updates');
  await setupBadgeUpdates();
  await updateBadge(); // Update immediately on install
});

// Handle when extension wakes up from idle state
if (chrome.idle && chrome.idle.onStateChanged) {
  chrome.idle.onStateChanged.addListener(async (newState) => {
    if (newState === 'active') {
      console.log('System became active - checking badge status');
      // Ensure alarm is still active and update badge
      const alarms = await chrome.alarms.getAll();
      const updateAlarm = alarms.find(a => a.name === 'updateBadge');
      if (!updateAlarm) {
        console.log('Alarm missing after idle, recreating...');
        await setupBadgeUpdates();
      }
      await updateBadge();
    }
  });
}

// Update badge when settings change
chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace === 'sync') {
    if (changes.baseURL || changes.apiKey) {
      api.isInitialized = false; // Force re-initialization
      updateBadge();
    }
    
    // If refresh interval changed, restart the alarm system
    if (changes.refreshInterval) {
      console.log('Refresh interval changed, restarting badge updates');
      await setupBadgeUpdates();
    }
  }
});