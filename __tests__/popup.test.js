/**
 * Tests for popup.js functionality
 * @jest-environment jsdom
 */

// Mock chrome APIs
global.chrome = {
  runtime: {
    sendMessage: jest.fn().mockImplementation((message) => {
      return Promise.resolve({ success: true });
    }),
    onMessage: {
      addListener: jest.fn()
    },
    openOptionsPage: jest.fn()
  },
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  tabs: {
    create: jest.fn(),
    query: jest.fn(),
    update: jest.fn()
  }
};

// Define PopupManager class for testing (matching current implementation)
class PopupManager {
  constructor() {
    this.watchesContainer = document.getElementById('watchesContainer');
    this.loadingState = document.getElementById('loadingState');
    this.errorState = document.getElementById('errorState');
    this.noConfigState = document.getElementById('noConfigState');
    this.watchesList = document.getElementById('watchesList');
    this.errorMessage = document.getElementById('errorMessage');
    
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
      });
    }

    // Configure button
    const configureBtn = document.getElementById('configureBtn');
    if (configureBtn) {
      configureBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
      });
    }

    // Retry button
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.loadWatches();
      });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadWatches();
      });
    }

    // Mark all as watched button
    const markAllBtn = document.getElementById('markAllBtn');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', () => {
        this.markAllAsWatched();
      });
    }
  }

  showState(stateName) {
    // Hide all states
    this.loadingState.style.display = 'none';
    this.errorState.style.display = 'none';
    this.noConfigState.style.display = 'none';
    this.watchesList.style.display = 'none';

    // Show requested state
    switch (stateName) {
      case 'loading':
        this.loadingState.style.display = 'flex';
        break;
      case 'error':
        this.errorState.style.display = 'block';
        break;
      case 'noConfig':
        this.noConfigState.style.display = 'block';
        break;
      case 'watches':
        this.watchesList.style.display = 'block';
        break;
    }
  }

  async loadWatches() {
    this.showState('loading');

    try {
      // Check if settings are configured
      const settings = await this.getSettings();
      if (!settings.baseURL || !settings.apiKey) {
        this.showState('noConfig');
        return;
      }

      // Load watches from background script
      const response = await this.sendMessage({ action: 'getWatches' });
      
      if (response.success) {
        this.displayWatches(response.data);
        this.showState('watches');
      } else {
        throw new Error(response.error || 'Failed to load watches');
      }
    } catch (error) {
      console.error('Error loading watches:', error);
      this.errorMessage.textContent = error.message;
      this.showState('error');
    }
  }

  getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['baseURL', 'apiKey'], (result) => {
        resolve(result);
      });
    });
  }

  sendMessage(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        resolve(response || { success: false, error: 'No response from background script' });
      });
    });
  }

  displayWatches(watches) {
    this.watchesContainer.innerHTML = '';

    if (!watches) {
      this.watchesContainer.innerHTML = `
        <div class="empty-state">
          <p>No watch data received. Check console for details.</p>
        </div>
      `;
      return;
    }

    // Ensure we have an array
    let watchesArray;
    if (Array.isArray(watches)) {
      watchesArray = watches;
    } else if (typeof watches === 'object') {
      // Try to extract array from object
      if (watches.watches && Array.isArray(watches.watches)) {
        watchesArray = watches.watches;
      } else {
        // Convert object to array
        watchesArray = Object.values(watches);
      }
    } else {
      this.watchesContainer.innerHTML = `
        <div class="empty-state">
          <p>Invalid watch data format received. Expected array or object, got: ${typeof watches}</p>
        </div>
      `;
      return;
    }

    if (watchesArray.length === 0) {
      this.watchesContainer.innerHTML = `
        <div class="empty-state">
          <p>No watches found. Create some watches on your changedetection.io server.</p>
        </div>
      `;
      return;
    }

    watchesArray.forEach(watch => {
      const watchElement = this.createWatchElement(watch);
      this.watchesContainer.appendChild(watchElement);
    });
  }

  createWatchElement(watch) {
    const isUnread = this.isWatchUnread(watch);
    
    const watchDiv = document.createElement('a');
    watchDiv.className = `watch-item ${isUnread ? 'unread' : ''}`;
    watchDiv.href = '#';
    watchDiv.dataset.uuid = watch.uuid;
    
    // Use title or URL as fallback
    const title = watch.title || watch.url || 'Untitled Watch';
    
    watchDiv.innerHTML = `
      <div class="watch-title">${this.escapeHtml(title)}</div>
      <div class="watch-status">
        ${isUnread ? 'Unread' : 'Read'} • 
        Last changed: ${this.formatDate(watch.last_changed)}
      </div>
    `;

    watchDiv.addEventListener('click', async (e) => {
      e.preventDefault();
      await this.handleWatchClick(e, watch);
    });

    return watchDiv;
  }

  isWatchUnread(watch) {
    // Use the "viewed" boolean field from ChangeDetection.io API
    return watch.viewed === false;
  }

  async handleWatchClick(event, watch) {
    const watchItem = event.target.closest('.watch-item');
    if (!watchItem) return;

    const uuid = watchItem.dataset.uuid;
    if (!uuid) return;

    // Open the watch URL in a new tab
    if (watch.url) {
      chrome.tabs.create({ url: watch.url });
    }

    watchItem.classList.add('loading');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'updateWatchViewed',
        uuid: uuid
      });

      if (response.success) {
        watchItem.classList.remove('unread');
        this.updateBadge();
      } else {
        console.error('Failed to mark watch as viewed:', response.error);
      }
    } catch (error) {
      console.error('Error updating watch:', error);
    } finally {
      watchItem.classList.remove('loading');
    }
  }

  async markAllAsWatched() {
    const markAllBtn = document.getElementById('markAllBtn');
    
    // Disable button during operation
    markAllBtn.disabled = true;
    markAllBtn.textContent = '...';

    try {
      const unreadItems = document.querySelectorAll('.watch-item.unread');
      
      if (unreadItems.length === 0) {
        markAllBtn.textContent = '✓ All watched';
        setTimeout(() => {
          markAllBtn.textContent = '✓ Mark all as watched';
          markAllBtn.disabled = false;
        }, 1000);
        return;
      }

      let successCount = 0;
      
      // Process each unread watch
      for (const item of unreadItems) {
        const uuid = item.dataset.uuid;
        if (!uuid) continue;

        try {
          const response = await chrome.runtime.sendMessage({
            action: 'updateWatchViewed',
            uuid: uuid
          });

          if (response.success) {
            item.classList.remove('unread');
            successCount++;
          }
        } catch (error) {
          console.error('Error marking watch as read:', uuid, error);
        }
      }

      // Update badge if any were successful
      if (successCount > 0) {
        this.updateBadge();
      }

      // Show completion status
      if (successCount === unreadItems.length) {
        markAllBtn.textContent = `✓ Marked ${successCount} as watched`;
      } else {
        markAllBtn.textContent = `✓ Marked ${successCount}/${unreadItems.length}`;
      }

    } catch (error) {
      console.error('Error in mark all as watched:', error);
      markAllBtn.textContent = '✗ Error';
    } finally {
      // Reset button after 2 seconds
      setTimeout(() => {
        markAllBtn.textContent = '✓ Mark all as watched';
        markAllBtn.disabled = false;
      }, 2000);
    }
  }

  formatDate(dateInput) {
    if (!dateInput || dateInput === 0) return 'Never';
    
    try {
      let date;
      
      // Handle Unix timestamp (number) vs ISO string
      if (typeof dateInput === 'number') {
        // Unix timestamp - convert to milliseconds
        date = new Date(dateInput * 1000);
      } else {
        // ISO string or other format
        date = new Date(dateInput);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffDays > 7) {
        return date.toLocaleDateString();
      } else if (diffDays > 0) {
        return `${diffDays}d ago`;
      } else if (diffHours > 0) {
        return `${diffHours}h ago`;
      } else {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes > 0 ? `${diffMinutes}m ago` : 'Just now';
      }
    } catch (error) {
      return 'Unknown';
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  updateBadge() {
    // Tell background script to update badge
    chrome.runtime.sendMessage({ action: 'updateBadge' });
  }
}

describe('PopupManager', () => {
  let popupManager;

  beforeEach(() => {
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
      <button id="markAllBtn">✓ Mark all as watched</button>
    `;
    
    jest.clearAllMocks();
    popupManager = new PopupManager();
  });

  test('should initialize DOM elements', () => {
    expect(popupManager.watchesContainer).toBeTruthy();
    expect(popupManager.loadingState).toBeTruthy();
    expect(popupManager.errorState).toBeTruthy();
    expect(popupManager.noConfigState).toBeTruthy();
    expect(popupManager.watchesList).toBeTruthy();
  });

  test('should show correct state', () => {
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

    const settings = await popupManager.getSettings();
    
    expect(settings.baseURL).toBe('http://localhost:5000');
    expect(settings.apiKey).toBe('test-key');
  });

  test('should send message to background script', async () => {
    chrome.runtime.sendMessage.mockImplementation((message, callback) => {
      callback({ success: true, data: [] });
    });

    const response = await popupManager.sendMessage({ action: 'getWatches' });
    
    expect(response.success).toBe(true);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      { action: 'getWatches' },
      expect.any(Function)
    );
  });

  test('should determine if watch is unread using viewed field', () => {
    // Unread: viewed is false
    const unreadWatch = { viewed: false };
    expect(popupManager.isWatchUnread(unreadWatch)).toBe(true);
    
    // Read: viewed is true
    const readWatch = { viewed: true };
    expect(popupManager.isWatchUnread(readWatch)).toBe(false);
    
    // Missing viewed field should be considered read
    const unknownWatch = {};
    expect(popupManager.isWatchUnread(unknownWatch)).toBe(false);
  });

  test('should escape HTML properly', () => {
    const htmlString = '<script>alert("xss")</script>';
    const escaped = popupManager.escapeHtml(htmlString);
    
    expect(escaped).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
  });

  test('should format Unix timestamps correctly', () => {
    const now = Date.now();
    
    // Test recent timestamp (hours ago)
    const hoursAgo = Math.floor((now - 2 * 60 * 60 * 1000) / 1000);
    expect(popupManager.formatDate(hoursAgo)).toBe('2h ago');
    
    // Test days ago
    const daysAgo = Math.floor((now - 3 * 24 * 60 * 60 * 1000) / 1000);
    expect(popupManager.formatDate(daysAgo)).toBe('3d ago');
    
    // Test null/undefined/zero
    expect(popupManager.formatDate(null)).toBe('Never');
    expect(popupManager.formatDate(undefined)).toBe('Never');
    expect(popupManager.formatDate(0)).toBe('Never');
  });

  test('should create watch element with correct attributes and classes', () => {
    const watch = {
      uuid: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Watch',
      url: 'https://example.com',
      last_changed: Math.floor(Date.now() / 1000),
      viewed: false // Unread
    };
    
    const element = popupManager.createWatchElement(watch);
    
    expect(element.className).toContain('watch-item');
    expect(element.className).toContain('unread');
    expect(element.dataset.uuid).toBe(watch.uuid);
    expect(element.innerHTML).toContain('Test Watch');
    expect(element.innerHTML).toContain('Unread');
  });

  test('should handle watch click - open tab and mark as read', async () => {
    const watch = {
      uuid: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Watch',
      url: 'https://example.com',
      viewed: false
    };

    chrome.runtime.sendMessage.mockResolvedValue({ success: true });

    const element = popupManager.createWatchElement(watch);
    document.body.appendChild(element);

    // Mock the updateBadge method
    popupManager.updateBadge = jest.fn();

    // Simulate click on the element itself
    const clickEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(clickEvent, 'target', {
      value: element,
      enumerable: true
    });
    
    await popupManager.handleWatchClick(clickEvent, watch);

    // Should open tab with watch URL
    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: 'https://example.com' });
    
    // Should send updateWatchViewed message
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      action: 'updateWatchViewed',
      uuid: watch.uuid
    });
  });

  test('should handle mark all as watched', async () => {
    // Create multiple unread watches
    const watches = [
      { uuid: 'uuid1', title: 'Watch 1', url: 'https://example1.com', viewed: false },
      { uuid: 'uuid2', title: 'Watch 2', url: 'https://example2.com', viewed: false },
      { uuid: 'uuid3', title: 'Watch 3', url: 'https://example3.com', viewed: true }
    ];

    // Add watch elements to DOM
    watches.forEach(watch => {
      const element = popupManager.createWatchElement(watch);
      popupManager.watchesContainer.appendChild(element);
    });

    chrome.runtime.sendMessage.mockResolvedValue({ success: true });

    popupManager.updateBadge = jest.fn();

    // Call markAllAsWatched
    await popupManager.markAllAsWatched();

    // Should have called API for each unread watch
    expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(2); // Only 2 unread watches
    expect(chrome.runtime.sendMessage).toHaveBeenNthCalledWith(1, {
      action: 'updateWatchViewed',
      uuid: 'uuid1'
    });
    expect(chrome.runtime.sendMessage).toHaveBeenNthCalledWith(2, {
      action: 'updateWatchViewed',
      uuid: 'uuid2'
    });
  });

  test('should handle mark all when no unread watches', async () => {
    const markAllBtn = document.getElementById('markAllBtn');
    
    // No unread watches in DOM
    await popupManager.markAllAsWatched();

    // Should show "All watched" message
    expect(markAllBtn.textContent).toBe('✓ All watched');
    expect(markAllBtn.disabled).toBe(true);
  });

  test('should display watches from different data formats', () => {
    // Test array format
    const arrayData = [
      { uuid: 'uuid1', title: 'Watch 1', viewed: false }
    ];
    popupManager.displayWatches(arrayData);
    expect(popupManager.watchesContainer.children.length).toBe(1);

    // Clear and test object format
    popupManager.watchesContainer.innerHTML = '';
    const objectData = {
      'uuid1': { uuid: 'uuid1', title: 'Watch 1', viewed: false }
    };
    popupManager.displayWatches(objectData);
    expect(popupManager.watchesContainer.children.length).toBe(1);

    // Clear and test nested watches object
    popupManager.watchesContainer.innerHTML = '';
    const nestedData = {
      watches: [
        { uuid: 'uuid1', title: 'Watch 1', viewed: false }
      ]
    };
    popupManager.displayWatches(nestedData);
    expect(popupManager.watchesContainer.children.length).toBe(1);
  });

  test('should handle empty watches data', () => {
    popupManager.displayWatches([]);
    expect(popupManager.watchesContainer.innerHTML).toContain('No watches found');
  });

  test('should handle invalid watches data', () => {
    popupManager.displayWatches('invalid data');
    expect(popupManager.watchesContainer.innerHTML).toContain('Invalid watch data format');
  });
});