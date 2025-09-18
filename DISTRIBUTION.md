# ChangeDetection.io Browser Extension - v1.0.0

A Chrome browser extension to monitor your ChangeDetection.io watches directly from your browser toolbar.

## 📦 Package Files

### For Chrome/Chromium browsers:
- **`changedetection-extension-chrome-v1.0.0.zip`** (88KB)
  - Uses Manifest V3
  - Compatible with Chrome, Edge, Brave, Opera, and other Chromium-based browsers

## 🚀 Installation Options

### Option 1: Chrome Web Store (Recommended)
1. Upload `changedetection-extension-chrome-v1.0.0.zip` to the Chrome Web Store
2. Go through the review process
3. Users can install from the store

### Option 2: Developer Mode (Immediate Installation)

#### For Chrome/Edge/Brave:
1. Download `changedetection-extension-chrome-v1.0.0.zip`
2. Extract the ZIP file to a folder
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" (top right toggle)
5. Click "Load unpacked" and select the extracted folder
6. The extension will appear in your toolbar

### Option 3: Enterprise/Private Distribution
- Distribute the ZIP file directly to users
- Use enterprise policies to auto-install
- Host on your own servers with update mechanisms

## ⚙️ Configuration

After installation:
1. Click the extension icon in your toolbar
2. Click "Settings" or "Configure"
3. Enter your ChangeDetection.io server details:
   - **Server URL**: Your ChangeDetection.io server (e.g., `https://your-server.com`)
   - **API Key**: Your API key from ChangeDetection.io
4. Set refresh intervals (optional):
   - **Initial refresh**: How often to check in the first hour (default: 2 minutes)
   - **Regular refresh**: How often to check after the first hour (default: 5 minutes)

## ✨ Features

- **Badge notifications**: Red dot shows when you have unread watches
- **Watch list**: View all your watches with unread status
- **Quick actions**: Click to open watch URL and mark as read
- **Bulk operations**: "Mark all as watched" button
- **Auto-refresh**: Configurable refresh intervals
- **Cross-browser**: Works on Chrome
- **Secure**: All data stays between your browser and your server

## 🔧 Technical Details

- **Chrome version**: Manifest V3, Service Worker background script
- **Permissions**: Storage, Tabs, Alarms, HTTP/HTTPS access
- **API Integration**: RESTful API calls with x-api-key authentication
- **Storage**: Uses browser sync storage for settings

## 📝 Version Information

- **Version**: 1.0.0
- **Build Date**: September 18, 2025
- **Compatibility**: Chrome 88+- **Package Size**: ~88KB each

## 🛠️ For Developers

If you want to modify or build from source:

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build packages
npm run package

# Development mode
npm run dev:chrome  # For Chrome
```

## 📄 License

MIT License - See LICENSE file for details.

## 🐛 Support

For issues or feature requests, please contact the extension developer or create an issue in the project repository.