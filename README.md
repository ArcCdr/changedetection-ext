# ChangeDetection.io Browser Extension

A browser extension that integrates with [changedetection.io](https://github.com/dgtlmoon/changedetection.io) to monitor your watches directly from your browser toolbar.

![Extension Demo](https://via.placeholder.com/600x300/667eea/ffffff?text=ChangeDetection.io+Browser+Extension)

## Features

- 🔍 **Watch Monitoring**: View all your changedetection.io watches in a clean popup interface
- 🔴 **Visual Indicators**: Red badge icon when unread watches are detected
- 📖 **Read Status**: Bold text for unread watches, regular text for read watches
- 🔗 **Quick Access**: Click any watch to open the monitored URL and mark it as read
- ⚙️ **Easy Setup**: Simple configuration for server URL and API key
- 🔄 **Auto Refresh**: Automatic background updates every 5 minutes
- 🌐 **Cross-Browser**: Compatible with Chrome and Firefox (Manifest V3)

## Installation

### From Source (Development)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd changedetection-ext
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the extension**:
   ```bash
   npm run build
   ```

4. **Load in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension directory

5. **Load in Firefox**:
   ```bash
   npm run dev:firefox
   ```

### Create Icon Files

The extension requires icon files in the `icons/` directory. Create these PNG files:
- `icon16.png` (16x16 pixels)
- `icon32.png` (32x32 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can use any image editor or generate simple icons online.

## Configuration

1. **Click the extension icon** in your browser toolbar
2. **Click "Configure"** or the settings gear icon
3. **Enter your server details**:
   - **Server URL**: Your changedetection.io server (e.g., `http://localhost:5000`)
   - **API Key**: Your API key from changedetection.io settings
4. **Click "Test Connection"** to verify the setup
5. **Click "Save Settings"** to store your configuration

### Getting Your API Key

1. Open your changedetection.io web interface
2. Go to **Settings**
3. Find the **API** section
4. Enable the API if not already enabled
5. Copy your API key

## Usage

### Viewing Watches

- Click the extension icon to open the popup
- See all your watches with their current status
- **Bold text** = unread (last_viewed < last_changed)
- **Regular text** = read (last_viewed >= last_changed)
- Red badge on icon = at least one unread watch

### Opening Watches

- Click any watch in the list
- Opens the monitored URL in a new tab
- Automatically marks the watch as read
- Updates the badge status

### Manual Refresh

- Click the "🔄 Refresh" button in the popup
- Background updates happen automatically every 5 minutes

## API Integration

The extension uses the changedetection.io REST API:

- **GET** `/api/v1/watch/` - Fetch all watches
- **PATCH** `/api/v1/watch/{uuid}` - Update watch (mark as read)

All requests include the `x-api-key` header with your API key.

### Read Status Logic

A watch is considered **unread** when:
- `last_changed` has a value AND
- `last_viewed` is null OR `last_viewed <= last_changed`

## Development

### Project Structure

```
changedetection-ext/
├── manifest.json          # Extension manifest (Manifest V3)
├── background.js          # Service worker for API calls and badge
├── popup.html            # Popup interface HTML
├── popup.js              # Popup interface logic
├── popup.css             # Popup interface styles
├── options.html          # Settings page HTML
├── options.js            # Settings page logic
├── options.css           # Settings page styles
├── content.js            # Content script (minimal)
├── icons/                # Extension icons (16, 32, 48, 128px)
├── __tests__/            # Jest unit tests
├── package.json          # NPM dependencies and scripts
└── README.md            # This file
```

### Available Scripts

```bash
# Run tests
npm test
npm run test:watch

# Lint code
npm run lint
npm run lint:fix

# Build and validate
npm run build

# Development (Firefox)
npm run dev:firefox

# Package for distribution
npm run package:firefox
npm run package:chrome
```

### Testing

The project includes comprehensive unit tests using Jest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test background.test.js
```

Test coverage includes:
- ✅ API functionality and error handling
- ✅ Badge management logic
- ✅ Popup interface interactions
- ✅ Settings validation and storage
- ✅ Watch status calculations

### Browser Compatibility

| Feature | Chrome | Firefox |
|---------|--------|---------|
| Manifest V3 | ✅ | ✅ |
| Service Worker | ✅ | ✅ |
| Storage API | ✅ | ✅ |
| Badge API | ✅ | ✅ |
| Tabs API | ✅ | ✅ |

## Troubleshooting

### Common Issues

**❌ "Please configure your server URL and API key first"**
- Ensure you've entered both the server URL and API key in settings
- Click "Test Connection" to verify the configuration

**❌ "Connection failed: API request failed: 401 Unauthorized"**
- Check your API key is correct
- Ensure the API is enabled in changedetection.io settings

**❌ "Connection failed: Failed to fetch"**
- Verify your server URL is correct and accessible
- Check if your server is running
- Ensure there are no firewall/CORS issues

**❌ Extension icon shows no badge despite unread watches**
- Check browser console for errors
- Try refreshing manually with the "🔄 Refresh" button
- Verify API permissions in extension settings

### Debug Mode

Enable developer tools to see detailed logs:

1. **Chrome**: Right-click extension icon → "Inspect popup"
2. **Firefox**: about:debugging → This Firefox → Inspect

Check console logs for API responses and error details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run the test suite (`npm test`)
6. Commit your changes (`git commit -am 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines

- Follow ESLint rules (run `npm run lint`)
- Write tests for new features
- Update documentation as needed
- Test in both Chrome and Firefox
- Keep the popup responsive and lightweight

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [changedetection.io](https://github.com/dgtlmoon/changedetection.io) - The amazing change detection service
- [web-ext](https://github.com/mozilla/web-ext) - Firefox extension development tool
- [Jest](https://jestjs.io/) - Testing framework

## Support

If you encounter any issues or have feature requests:

1. Check the [troubleshooting section](#troubleshooting)
2. Search existing issues on GitHub
3. Create a new issue with detailed information

---

**Made with ❤️ for the changedetection.io community**