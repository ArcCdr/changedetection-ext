// Content script for ChangeDetection.io extension
// This script runs on all pages to enable tab management

// Currently, this extension doesn't need complex content script functionality
// since watch management is handled through the popup and background script.
// This file is included to satisfy the manifest requirements and can be extended
// in the future for features like:
// - Detecting if the current page is a changedetection.io watch URL
// - Showing inline notifications
// - Adding page-specific controls

console.log('ChangeDetection.io Monitor: Content script loaded');

// Listen for messages from popup/background if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle any content script specific messages here
  if (request.action === 'ping') {
    sendResponse({ success: true });
  }
});