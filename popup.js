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

    if (!watches || watches.length === 0) {
      this.watchesContainer.innerHTML = `
        <div class="empty-state">
          <p>No watches found. Create some watches on your changedetection.io server.</p>
        </div>
      `;
      return;
    }

    watches.forEach(watch => {
      const watchElement = this.createWatchElement(watch);
      this.watchesContainer.appendChild(watchElement);
    });
  }

  createWatchElement(watch) {
    const isUnread = this.isWatchUnread(watch);
    
    const watchDiv = document.createElement('a');
    watchDiv.className = `watch-item ${isUnread ? 'unread' : ''}`;
    watchDiv.href = '#';
    
    // Use title or URL as fallback
    const title = watch.title || watch.url || 'Untitled Watch';
    const url = watch.url || '#';
    
    watchDiv.innerHTML = `
      <div class="watch-title">${this.escapeHtml(title)}</div>
      <div class="watch-url">${this.escapeHtml(url)}</div>
      <div class="watch-status">
        ${isUnread ? 'Unread' : 'Read'} • 
        Last changed: ${this.formatDate(watch.last_changed)}
      </div>
    `;

    watchDiv.addEventListener('click', async (e) => {
      e.preventDefault();
      await this.handleWatchClick(watch);
    });

    return watchDiv;
  }

  isWatchUnread(watch) {
    if (!watch.last_changed) return false;
    if (!watch.last_viewed) return true;
    
    const lastChanged = new Date(watch.last_changed);
    const lastViewed = new Date(watch.last_viewed);
    
    return lastViewed <= lastChanged;
  }

  async handleWatchClick(watch) {
    try {
      // Open the URL in a new tab
      if (watch.url) {
        await chrome.tabs.create({ url: watch.url });
      }

      // Mark as read
      if (watch.uuid) {
        await this.sendMessage({ 
          action: 'markAsRead', 
          uuid: watch.uuid 
        });
        
        // Reload watches to update display
        this.loadWatches();
      }
    } catch (error) {
      console.error('Error handling watch click:', error);
    }
  }

  formatDate(dateString) {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
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
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});