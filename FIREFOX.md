# Firefox Installation Guide

Due to Firefox's experimental Manifest V3 support, we provide a Manifest V2 version for better compatibility.

## Quick Firefox Setup

### Option 1: Use Firefox-specific manifest (Recommended)
```bash
# Load the Firefox-compatible manifest
cp manifest-firefox.json manifest.json
```

Then load in Firefox:
1. Open `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on..."
4. Select `manifest.json` from this directory

### Option 2: Use Firefox manifest directly
1. Open `about:debugging`
2. Click "This Firefox" 
3. Click "Load Temporary Add-on..."
4. Select `manifest-firefox.json` (not the regular manifest.json)

## Differences between manifests

### manifest.json (Chrome/MV3)
- Uses `service_worker` for background
- Uses `action` for popup
- Uses `host_permissions` for API access

### manifest-firefox.json (Firefox/MV2)
- Uses `scripts` array for background
- Uses `browser_action` for popup  
- Uses `permissions` for API access
- More compatible with current Firefox

## Switch back to Chrome
```bash
git checkout manifest.json
# Or run: npm run chrome-setup
```

The extension functionality is identical in both browsers - only the manifest format differs.