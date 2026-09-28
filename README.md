# ChangeDetection.io Monitor

A Chrome extension that connects to your self-hosted [changedetection.io](https://github.com/dgtlmoon/changedetection.io)
server, shows unread changes on the toolbar badge, and lets you review and manage your watches
without opening the server's web UI.

## Features

- Toolbar badge shows the unread count (capped at `99+`) and turns into a grey `!` with the
  error in its tooltip when the server can't be reached.
- Click a watch to open its diff page and mark it viewed; the `↗` link opens the monitored page
  itself.
- Ctrl/Cmd-click or middle-click a watch to open it in a background tab and keep the popup open.
- **Mark all viewed** and **Recheck all** buttons for bulk actions.
- A filter box appears once you have 10 or more watches.
- **Watch this page** adds the active browser tab as a new watch.
- Watches with a server-side error show a warning marker with the error as a tooltip.
- Dark mode follows your OS theme; every control is keyboard accessible.
- `Alt+Shift+D` opens the popup without touching the mouse.
- Optional desktop notifications when a watch changes.

## Requirements

- Chrome 120 or later (or another Chromium-based browser)
- A changedetection.io server, version 0.50.12 or newer, with the API enabled and an API key

## Install

- **Load unpacked**: download or clone this repository, open `chrome://extensions`, enable
  *Developer mode*, click *Load unpacked* and select the `src/` folder.
- **Or build the zip**: `npm run package` creates
  `dist/changedetection-extension-chrome-v<version>.zip`; extract it and load it unpacked, or
  upload it to the Chrome Web Store.

## Setup

1. Open the extension's options page (the gear icon in the popup, or right-click the toolbar
   icon → *Options*).
2. **Server URL**: the address you open changedetection.io at in your browser, e.g.
   `http://192.168.1.10:5000`.
3. **API key**: in changedetection.io, under *Settings → API*.
4. Click **Test connection** to confirm the server answers before saving.
5. Click **Save**. Chrome asks once for permission to access that server — accept it; servers on
   your local network need this to be reachable at all.

## Troubleshooting

- **API key rejected** — check the key was copied in full from *Settings → API*.
- **API not found** — check the server URL and that your changedetection.io is 0.50.12 or newer.
- **Access not granted** — click *Grant access* in the popup, or *Save* again in the options page
  and accept the permission prompt.
- **Cannot reach the server / did not respond** — the server is down, unreachable from this
  network, or slow; the extension keeps showing the last watch list it fetched successfully.
- **Grey `!` on the badge** — the last two refreshes failed in a row; hover the icon for the
  error.

## Privacy

The extension only ever talks to the changedetection.io server you configure. Your server URL,
API key, refresh interval and notification preference are stored in Chrome's synced storage
(`chrome.storage.sync`), so they roam with your Chrome profile.

## Development

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the code layout and contracts, and run
`npm run check` before sending changes.

## License

MIT — see [LICENSE](LICENSE).
