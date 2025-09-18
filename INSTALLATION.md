# Installation Checklist

## ✅ Pre-Installation Requirements

- [ ] ChangeDetection.io server is running and accessible
- [ ] API is enabled in changedetection.io settings
- [ ] You have your API key from changedetection.io

## ✅ Extension Installation

### Chrome
- [ ] Run `npm run build:chrome` in terminal to create clean distribution
- [ ] Open `chrome://extensions/`
- [ ] Enable "Developer mode" (toggle in top right)
- [ ] Click "Load unpacked"
- [ ] **Select the `dist` directory** (not the main project directory)
- [ ] Extension icon appears in toolbar

**Note**: If you get "Could not load icon" errors, ensure the icon files in the `icons/` directory are valid PNG files, not empty files.

## ✅ Extension Configuration

- [ ] Click the extension icon in toolbar
- [ ] Click "Configure" or gear icon
- [ ] Enter your server URL (e.g., `http://localhost:5000`)
- [ ] Enter your API key
- [ ] Click "Test Connection" - should show "Connection successful!"
- [ ] Click "Save Settings"

## ✅ Verification Steps

- [ ] Click extension icon - should show loading then watches list
- [ ] Verify watches show with correct read/unread status
- [ ] Bold text = unread, regular text = read
- [ ] Click a watch - should open URL in new tab
- [ ] Refresh the popup - watch should now show as read
- [ ] If unread watches exist, extension icon shows red badge

## ✅ Troubleshooting

### "Please configure your server URL and API key first"
- [ ] Ensure both fields are filled in settings
- [ ] Verify server URL includes `http://` or `https://`
- [ ] Check API key is copied correctly

### "Connection failed: 401 Unauthorized"
- [ ] Verify API key is correct
- [ ] Check API is enabled in changedetection.io settings
- [ ] Try regenerating API key in changedetection.io

### "Connection failed: 404 Not Found" or "API request failed: 404 NOT FOUND"
- [ ] **Check API is enabled**: In ChangeDetection.io, go to Settings → API and ensure "Enable API" is checked
- [ ] **Verify server URL**: Should be just the base URL (e.g., `http://localhost:5000`) without `/api/v1/watch`
- [ ] **Test API manually**: Try `curl -X GET "http://localhost:5000/api/v1/watch" -H "x-api-key: YOUR_KEY"` in terminal
- [ ] **Check ChangeDetection.io version**: Older versions might not have the v1 API endpoint
- [ ] **Try browser**: Visit `http://localhost:5000/api/v1/watch` in browser to see if endpoint exists

### "Connection failed: Failed to fetch"
- [ ] Verify server URL is correct
- [ ] Check server is running and accessible
- [ ] Test URL in browser directly
- [ ] Check for firewall/network issues

### Extension icon shows no badge despite unread watches
- [ ] Click refresh button in popup
- [ ] Check browser console for errors (right-click icon → Inspect)
- [ ] Verify watch dates are valid in API response

### "Could not load icon" errors
- [ ] Run `npm run build:chrome` to rebuild with valid icons
- [ ] Ensure icon files in `icons/` directory are not empty
- [ ] Check that `dist/icons/` contains valid PNG files

### "watches.forEach is not a function" or data format errors
- [ ] Check browser console (right-click extension icon → Inspect) for logged data structure
- [ ] The extension now handles different API response formats automatically
- [ ] If issue persists, your ChangeDetection.io version might return data in an unexpected format

## ✅ Common Setup Issues

### ChangeDetection.io API Setup
1. **Enable API in ChangeDetection.io**:
   - Open your ChangeDetection.io web interface
   - Go to **Settings** → **API** 
   - Check "**Enable API**" checkbox
   - Copy your API key

2. **Test API manually** (optional debugging):
   ```bash
   # Replace with your server URL and API key
   curl -X GET "http://localhost:5000/api/v1/watch" -H "x-api-key: YOUR_API_KEY_HERE"
   ```
   Should return JSON with your watches, not a 404 error.

3. **Server URL Format**:
   - ✅ Correct: `http://localhost:5000` 
   - ✅ Correct: `https://changedetection.mydomain.com`
   - ❌ Wrong: `http://localhost:5000/api/v1/watch/`
   - ❌ Wrong: Missing `http://` or `https://`

## ✅ Development Testing (Optional)

- [ ] Run `npm test` - all tests pass
- [ ] Run `npm run lint` - no lint errors
- [ ] Load extension in both Chrome
- [ ] Test with various watch states (read/unread/empty)
- [ ] Test error scenarios (server down, wrong API key)

## 🎉 Success Criteria

When everything is working correctly:
- ✅ Extension loads without errors
- ✅ Popup shows your watches with correct status
- ✅ Clicking watches opens URLs and marks as read
- ✅ Badge appears/disappears based on unread status
- ✅ Settings persist between browser sessions
- ✅ Auto-refresh updates badge every 5 minutes

---

**Need Help?** Check the [README.md](README.md) troubleshooting section or create an issue on GitHub.