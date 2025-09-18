# Development Guide

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Load extension in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select this directory

## Development Workflow

### Testing
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode

### Code Quality
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix auto-fixable issues

### Building
- `npm run build` - Lint and test
- `npm run package:firefox` - Package for Firefox
- `npm run package:chrome` - Package for Chrome

## Architecture Overview

### Background Script (`background.js`)
- Service worker that handles API communication
- Manages badge status (red dot when unread watches exist)
- Provides messaging interface for popup and options

### Popup Interface (`popup.html/js/css`)
- Main user interface showing watch list
- Handles watch clicks (opens URL + marks as read)
- Shows loading/error/empty states

### Options Page (`options.html/js/css`)
- Configuration interface for server URL and API key
- Connection testing functionality
- Settings persistence using Chrome storage API

### Content Script (`content.js`)
- Minimal script injected into all pages
- Currently used for future extensibility

## Key Features

- **Auto-refresh**: Background updates every 5 minutes
- **Badge management**: Red dot indicator for unread watches
- **Cross-browser**: Manifest V3 compatible with Chrome
- **Offline handling**: Graceful error states when server unreachable
- **Security**: All API requests include proper headers and validation

## Common Development Tasks

### Adding a new API endpoint
1. Add method to `ChangeDetectionAPI` class in `background.js`
2. Add message handler in background script
3. Call from popup/options using `sendMessage()`

### Modifying the UI
1. Update HTML in `popup.html` or `options.html`
2. Modify corresponding CSS file for styling
3. Update JavaScript logic in `popup.js` or `options.js`

### Adding tests
1. Create test file in `__tests__/` directory
2. Mock Chrome APIs as needed
3. Test both success and error cases

### Debugging
- **Chrome**: Right-click extension icon → "Inspect popup"
- Check console logs for API responses and errors