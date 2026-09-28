# History

## 1.1.1 — 2026-09-28

- Clicking a watch opens the monitored page again, as in 1.0.x. Watches that have changed get a
  **Diff** button that opens the diff page instead. Both mark the watch viewed, and both open in a
  background tab with Ctrl/Cmd-click or middle-click.
- Clicking a single-watch desktop notification now opens the monitored page and marks the watch
  viewed, so the badge updates.

## 1.1.0 — 2026-09-28

- Fixed the unread rule: a brand-new watch (never changed) no longer lights the badge or shows as
  unread in the popup.
- Toolbar badge now shows the unread count, capped at `99+`, and turns into a grey `!` with the
  error in its tooltip from the second consecutive failed refresh.
- Opening a watch now goes straight to its diff page and marks it viewed with a single `PUT`
  request.
- Test connection checks the typed server URL and API key without saving them.
- Server access is now an optional host permission requested for the exact configured origin, so
  servers on the local network work without a blanket host permission; the `tabs` permission and
  the unused content script were removed.
- Added request timeouts and user-safe, categorized error messages instead of raw fetch failures.
- Popup renders the last cached watch list instantly and keeps showing it, with its age, if a
  refresh then fails.
- Added: `↗` link to open the monitored page directly; Ctrl/Cmd-click and middle-click to open a
  watch in the background; Mark all viewed (bounded concurrency); Recheck all; a filter box once
  there are 10 or more watches; Watch this page; a per-watch error marker; dark mode; keyboard
  accessibility including an `Alt+Shift+D` shortcut; optional desktop notifications for watches
  that changed since the previous refresh.
- Rebuilt the toolchain: ESLint 10 flat config with a mandatory JSDoc gate, Jest 30 with an
  in-memory `chrome.*` fake, and a `npm run package` script that builds the release zip.

## 1.0.1 — 2025-09-26

- Hardened permissions: removed the `tabs` permission, the blanket host permissions and the
  content script.

## 1.0.0 — 2025-09-17 → 2025-09-23

- Initial Chrome Manifest V3 release: watch list popup, unread badge, mark-as-watched, a single
  refresh interval, sorting by last change, extension icons, stability fixes and a version
  display.
