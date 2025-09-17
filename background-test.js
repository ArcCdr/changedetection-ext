// Minimal background script for Firefox testing
console.log('ChangeDetection.io Extension: Background script loaded in Firefox');

// Test if chrome APIs are available
if (typeof chrome !== 'undefined') {
  console.log('Chrome APIs available');
  
  // Test storage
  if (chrome.storage) {
    console.log('Storage API available');
  }
  
  // Test browserAction vs action
  if (chrome.browserAction) {
    console.log('browserAction API available (MV2)');
  }
  if (chrome.action) {
    console.log('action API available (MV3)');
  }
  
  // Simple message listener
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received:', request);
    sendResponse({ success: true, message: 'Background script responding' });
  });
  
} else {
  console.error('Chrome APIs not available');
}