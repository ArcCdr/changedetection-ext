# Installation Checklist

## ✅ Pre-Installation Requirements

- [ ] ChangeDetection.io server is running and accessible
- [ ] API is enabled in changedetection.io settings
- [ ] You have your API key from changedetection.io

## ✅ Extension Installation

### Chrome
- [ ] Open `chrome://extensions/`
- [ ] Enable "Developer mode" (toggle in top right)
- [ ] Click "Load unpacked"
- [ ] Select the `changedetection-ext` directory
- [ ] Extension icon appears in toolbar

### Firefox
- [ ] Run `npm run dev:firefox` in terminal
- [ ] Firefox opens with extension loaded temporarily
- [ ] Extension icon appears in toolbar

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

### "Connection failed: Failed to fetch"
- [ ] Verify server URL is correct
- [ ] Check server is running and accessible
- [ ] Test URL in browser directly
- [ ] Check for firewall/network issues

### Extension icon shows no badge despite unread watches
- [ ] Click refresh button in popup
- [ ] Check browser console for errors (right-click icon → Inspect)
- [ ] Verify watch dates are valid in API response

## ✅ Development Testing (Optional)

- [ ] Run `npm test` - all tests pass
- [ ] Run `npm run lint` - no lint errors
- [ ] Load extension in both Chrome and Firefox
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