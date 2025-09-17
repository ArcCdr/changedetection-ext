// Popup script for ChangeDetection.io extension

class PopupManager {
  constructor() {
    this.watchesContainer = document.getElementById('watchesContainer');
    this.loadingState = document.getElementById('loadingState');
    this.errorState = document.getElementById('errorState');
    this.noConfigState = document.getElementById('noConfigState');
    this.watchesList = document.getElementById('watchesList');
    this.errorMessage = document.getElementById('errorMessage');
    
    this.initializeEventListeners();
    this.loadWatches();
  }

  initializeEventListeners() {
    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });

    // Configure button
    document.getElementById('configureBtn').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });

    // Retry button
    document.getElementById('retryBtn').addEventListener('click', () => {
      this.loadWatches();
    });

    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', () => {
      this.loadWatches();
    });

    // Mark all as watched button
    document.getElementById('markAllBtn').addEventListener('click', () => {
      this.markAllAsWatched();
    });
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

    // Debug: log the data type and structure
    console.log('Received watches data:', watches, 'Type:', typeof watches, 'Is Array:', Array.isArray(watches));

    // Handle different data formats
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

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});