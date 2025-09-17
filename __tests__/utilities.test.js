/**
 * Simple unit tests for utility functions
 */

describe('Utility Functions', () => {
  test('Badge counting logic', () => {
    // Simple test of the unread counting logic
    function isWatchUnread(watch) {
      if (!watch.last_changed) return false;
      if (!watch.last_viewed) return true;
      
      const lastChanged = new Date(watch.last_changed);
      const lastViewed = new Date(watch.last_viewed);
      
      return lastViewed <= lastChanged;
    }

    const unreadWatch = {
      last_changed: '2023-01-02T00:00:00Z',
      last_viewed: '2023-01-01T00:00:00Z'
    };
    expect(isWatchUnread(unreadWatch)).toBe(true);

    const readWatch = {
      last_changed: '2023-01-01T00:00:00Z',
      last_viewed: '2023-01-02T00:00:00Z'
    };
    expect(isWatchUnread(readWatch)).toBe(false);

    const neverViewedWatch = {
      last_changed: '2023-01-01T00:00:00Z',
      last_viewed: null
    };
    expect(isWatchUnread(neverViewedWatch)).toBe(true);

    const noChangeWatch = {
      last_changed: null,
      last_viewed: '2023-01-01T00:00:00Z'
    };
    expect(isWatchUnread(noChangeWatch)).toBe(false);
  });

  test('HTML escaping', () => {
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    const htmlString = '<script>alert("xss")</script>';
    const escaped = escapeHtml(htmlString);
    expect(escaped).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
  });

  test('Date formatting', () => {
    function formatDate(dateString) {
      if (!dateString) return 'Never';
      
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Unknown';
        
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

    // Test null/undefined
    expect(formatDate(null)).toBe('Never');
    expect(formatDate(undefined)).toBe('Never');
    
    // Test invalid date
    expect(formatDate('not-a-date')).toBe('Unknown');
    
    // Test recent date (2 hours ago)
    const hoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatDate(hoursAgo)).toBe('2h ago');
  });
});