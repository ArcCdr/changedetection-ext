# Badge Notification Fixes

## Issues Identified and Fixed

### 1. **Inconsistent Unread Detection** ✅
- **Problem**: Code was using both `viewed` (boolean) and `last_viewed` vs `last_changed` (timestamps) inconsistently
- **Solution**: Implemented robust dual-check logic:
  1. Primary: Use `viewed` boolean field if available
  2. Fallback: Compare `last_viewed` vs `last_changed` timestamps
  3. Handle edge cases (never changed, missing fields)

### 2. **Chrome Alarm Persistence Issues** ✅
- **Problem**: Chrome can clear alarms during extended idle periods (browser open for days)
- **Solutions**:
  - Added alarm verification after each trigger
  - Implemented alarm watchdog that checks every hour
  - Added `when` parameter to ensure immediate alarm scheduling
  - Added idle state detection with alarm recovery

### 3. **Missing Badge Update Triggers** ✅
- **Problem**: Some scenarios didn't trigger badge updates consistently
- **Solutions**:
  - Added proper error handling (don't clear badge on API errors)
  - Added logging for debugging badge state
  - Added idle state wake-up handling
  - Improved startup/install handlers

### 4. **Long-term Reliability Improvements** ✅
- **Added**: `idle` permission for wake-up detection
- **Added**: Watchdog alarm (checks every 60 minutes)
- **Added**: Alarm recreation logic when Chrome clears them
- **Added**: Better logging for debugging
- **Added**: Async/await for badge operations

## Technical Changes

### Background Script (`background.js`)
```javascript
// Enhanced unread detection
function countUnreadWatches(watches) {
  // Primary: boolean field check
  if (typeof watch.viewed === 'boolean') {
    return watch.viewed === false;
  }
  
  // Fallback: timestamp comparison
  const lastChanged = watch.last_changed || 0;
  const lastViewed = watch.last_viewed || 0;
  return lastViewed === 0 || lastViewed < lastChanged;
}

// Alarm persistence handling
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'updateBadge') {
    await updateBadge();
    // Verify alarm still exists, recreate if needed
  }
});

// Watchdog alarm checks every hour
chrome.alarms.create('alarmWatchdog', { periodInMinutes: 60 });
```

### Popup Script (`popup.js`)
- Updated `isWatchUnread()` to match background script logic
- Ensures consistency between badge and UI display

### Manifest (`manifest.json`)
- Added `idle` permission for system state detection

## Expected Behavior

### Badge Display Rules
1. **Red dot (●)**: When any watch has `viewed: false` OR `last_viewed < last_changed`
2. **No badge**: When all watches are read OR never changed
3. **Persistence**: Badge state maintained even after browser idle for days

### Reliability Features
1. **Self-healing**: Automatically recreates alarms if Chrome clears them
2. **Wake-up detection**: Updates badge when system becomes active
3. **Error resilience**: Doesn't clear badge on temporary API errors
4. **Debug logging**: Console logs for troubleshooting

## Testing Recommendations

1. **Short-term**: Verify badge appears/disappears correctly with watch changes
2. **Long-term**: Leave browser open for 24+ hours and verify badge still updates
3. **Wake-up**: Put computer to sleep, wake up, verify badge updates within refresh interval
4. **Error handling**: Disconnect from ChangeDetection.io server, verify badge doesn't disappear

## Debug Information

Check browser console (F12) for these log messages:
- `"Updating badge..."` - Badge update attempts
- `"Found X watches, Y unread"` - Count verification
- `"Badge update alarm triggered"` - Alarm firing
- `"Watchdog detected missing alarm"` - Self-healing activation
- `"System became active - checking badge status"` - Wake-up handling