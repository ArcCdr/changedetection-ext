# Architecture

Manifest V3 Chrome extension, plain ES modules, no bundler and no runtime dependencies. `src/` is
loaded unpacked as-is and zipped as-is for release.

## Components

| File | Responsibility |
| --- | --- |
| `background.js` | Service worker entry point: routes messages to `lib/actions.js` and `lib/refresh.js` (`runAction`/`handleMessage`), and registers the lifecycle listeners below. |
| `lib/actions.js` | Operations invoked by the message router: `openWatch`, `markAllViewed`, `testConnection`, `addWatch`, `recheckAll`. Run in the service worker so they finish even after the popup closes. |
| `lib/api.js` | `ChangeDetectionClient`: thin fetch wrapper — `x-api-key` header, request timeout, JSON parsing — and `ApiError`, which turns failures into a user-safe message and a `kind`. |
| `lib/badge.js` | Toolbar badge and tooltip: `showUnreadBadge`, `showErrorBadge`, `clearBadge`. |
| `lib/cache.js` | Last fetched watch list in `chrome.storage.session`, so the popup can render before its own refresh completes. |
| `lib/format.js` | `formatRelativeTime` for "2h ago"-style timestamps. |
| `lib/log.js` | `createLogger(scope)`, the only allowed use of `console.*`. |
| `lib/messages.js` | The `ACTIONS` enum and `sendMessage()`, the non-throwing request helper used by the popup and options pages. |
| `lib/notify.js` | Opt-in desktop notifications for watches that changed since the previous refresh, and the URL a notification click opens. |
| `lib/refresh.js` | `refreshWatches()`: the refresh cycle described below. |
| `lib/scheduler.js` | Creates/renews the `refreshWatches` alarm and removes alarms used by versions ≤ 1.0.1. |
| `lib/settings.js` | Settings defaults, validation, loading, and host-permission helpers. |
| `lib/watches.js` | Pure helpers over watch objects: `normalizeWatchList`, `isUnread`, `countUnread`, `displayTitle`, `siteUrl`, `primaryUrl`, `sortWatches`, `filterWatches`, `findWatchByUrl`. No `chrome.*` or network access. |
| `popup/popup.js` | `PopupManager`: the popup page controller. |
| `popup/watch-item.js` | Builds the `<li>` DOM node for one watch, with `createElement`/`textContent` only. |
| `popup/popup.html`, `popup.css` | Popup markup and styles (light/dark). |
| `options/options.js` | `OptionsManager`: the options page controller. |
| `options/options.html`, `options.css` | Options markup and styles (light/dark). |
| `scripts/build.mjs` | Packages `src/` into `dist/changedetection-extension-chrome-v<version>.zip`. |

## Refresh cycle

`refreshWatches(reason)` (`lib/refresh.js`) fetches every watch and updates the cache, badge and
notifications. It runs on: the `refreshWatches` alarm, the popup's `getWatches` request, browser
startup, install/update, waking from idle, a `baseURL`/`apiKey` change, and a newly granted host
permission (`background.js`).

- **Failure counter** — `refreshFailureCount` (`chrome.storage.session`) resets to 0 on success.
  A single failure keeps the previous badge and logs a warning (e.g. the network is not back yet
  after sleep). From the second consecutive failure the badge turns into a grey `!` and the
  failure is logged at error level.
- **Badge** — the unread count, capped at `99+` (`badgeText`); cleared when the server URL or API
  key is not set; the grey `!` carries the error message in its tooltip.
- **Cache** — every successful refresh overwrites `watchCache` (`chrome.storage.session`).
  `openWatch`/`markAllViewed` update it in place (`markCachedViewed`) so the badge reflects a
  mark-as-viewed without a full refetch.
- **Notifications baseline** — every refresh (successful or not attempted due to missing config)
  stores the currently unread UUIDs in `notifiedUuids` (`chrome.storage.local`). The first run
  only stores the baseline; later runs notify for UUIDs unread now but absent from the previous
  baseline, and only when notifications are enabled and permitted.

## Message contract

Requests are `{action: ACTIONS.X, ...fields}`; responses are `{success: true, data?}` or
`{success: false, error, errorKind?}` (`lib/messages.js`). Sent only by `popup/popup.js` and
`options/options.js`; handled only by `runAction` in `background.js`.

| Action | Request fields | Response `data` |
| --- | --- | --- |
| `getWatches` | — | `{watches, fetchedAt}` |
| `openWatch` | `uuid, url, lastChanged, background` | — |
| `markAllViewed` | `items: {uuid, lastChanged}[]` | `{markedUuids, failed}` |
| `testConnection` | `baseURL, apiKey` | `{version, watchCount}` |
| `addWatch` | `url` | `{uuid}` |
| `recheckAll` | — | `{message}` |

## Storage keys

| Area | Key | Holds |
| --- | --- | --- |
| `sync` | `baseURL`, `apiKey`, `refreshInterval`, `notificationsEnabled` | User settings (`lib/settings.js`). |
| `session` | `watchCache` | Last fetched watch list and fetch time (`lib/cache.js`). |
| `session` | `refreshFailureCount` | Consecutive refresh failures (`lib/refresh.js`). |
| `local` | `notifiedUuids` | UUIDs notified about, to avoid repeat notifications (`lib/notify.js`). |

## Permission model

Required permissions are `storage`, `alarms`, `idle` and `activeTab`; `notifications` is optional
and requested when the user enables it in the options page. There is no `tabs` permission, no
static `host_permissions` and no content script: the popup only ever reads the active tab's URL
through `activeTab`, which Chrome grants for the tab the popup was opened over. Reaching the
configured server instead uses `optional_host_permissions: ["http://*/*", "https://*/*"]`
(manifest), narrowed at request time to the single origin the user configured
(`hostPermissionPattern`, `requestHostPermission`). This is requested synchronously inside the
Save/Test-connection click and the popup's Grant-access click, before any `await`, as Chrome
requires a user gesture for a permission prompt. Without it Chrome silently blocks fetches to
servers on the local network.

## Unread rule and server facts

`GET /api/v1/watch` returns an object keyed by watch UUID; `normalizeWatchList` turns it into an
array with `uuid` added. `last_changed` (Unix seconds) stays `0` until a watch has at least two
snapshots; `viewed` is the server's own read/unread flag and defaults to `false` for a brand-new
watch. `isUnread` is therefore `last_changed > 0 && viewed === false` — a new watch is never
unread even though `viewed` is `false`. Marking viewed sends a single
`PUT /api/v1/watch/<uuid>` with `{last_viewed: max(now, lastChanged)}`, the `max` absorbing clock
skew between browser and server. `${baseURL}/diff/<uuid>` is the diff page opened for a changed
watch (`primaryUrl`) and for a single-watch notification click (`notificationTarget`).

## Logging

`createLogger(scope)` (`lib/log.js`) prefixes every line with `[cdio:<scope>]`; ESLint's
`no-console` rule forbids `console.*` anywhere else in `src/`. Levels: `debug` for sub-steps,
`info` for one line per completed action, `warn` for degraded-but-continuing, `error` for a
failed operation. Messages use `%s`/`%d` placeholders; the API key and request headers are never
logged (`tests/lib/api.test.js` and others assert this with `allLogText()`).

## Testing

Jest 30 with `jest-environment-jsdom`. `tests/helpers/chrome-fake.js` is an in-memory `chrome.*`
fake, installed fresh before every test by `tests/helpers/install-chrome.js` and
`test-setup.js`; storage writes do not fire `chrome.storage.onChanged` automatically, so tests
dispatch it explicitly. `fetch` is a fresh `jest.fn()` per test. Console output is captured, not
printed; assert on it with `hasLog(level, pattern)` / `allLogText()` from
`tests/helpers/logs.js`. `loadHtml()` (`tests/helpers/dom.js`) loads a real page's markup into
jsdom without executing its script, for markup and controller tests.

## Build and release

`src/manifest.json` `version` is the single source of truth; `package.json` `version` must match
it, or `scripts/build.mjs` refuses to run. `npm run package` runs `npm run check` (lint +
coverage) and then zips the contents of `src/` into
`dist/changedetection-extension-chrome-v<version>.zip`, with `manifest.json` at the zip root.
