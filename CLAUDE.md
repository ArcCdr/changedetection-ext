# Project: ChangeDetection.io Monitor (Chrome extension)

Manifest V3 Chrome extension for a self-hosted changedetection.io server: lists the watches,
shows unread changes on the toolbar badge, opens diffs and marks them viewed. Plain JavaScript
ES modules, no bundler, no runtime dependencies: `src/` is the unpacked extension and is zipped
as-is for release.

## 0. Project rules

### Layout

- `src/` — the extension; load it unpacked from here. `manifest.json`, `background.js` (module
  service worker), `popup/`, `options/`, `lib/` (shared modules), `icons/`.
- `tests/` — Jest tests mirroring `src/` (`tests/lib/*.test.js`, `tests/popup/*.test.js`, …);
  `tests/helpers/` holds the in-memory `chrome` fake and test utilities.
- `scripts/` — repo tooling only (never shipped).
- `docs/` — `ARCHITECTURE.md` (developer map) and `HISTORY.md` (changelog).

### Documentation system (non-negotiable)

Documentation is multi-layer, each with a specific audience and governance:

- **Layer 1: User-facing** (`README.md`) — end users, no internals or code references. Black-box external view only.
- **Layer 2: Code** (JSDoc + in-code comments) — all as-built detail. This is the source of truth.
- `docs/ARCHITECTURE.md` describes structure and contracts; `docs/HISTORY.md` records releases.
  Keep all narrative docs short and to the point.

**JSDoc is mandatory and gated** (ESLint + `eslint-plugin-jsdoc`, run by `npm run lint`):
- Every file under `src/` and `scripts/` starts with a `/** @file … */` overview.
- Every function declaration, class and method has a JSDoc block: a description, then a blank
  line, then `@param {type} name - text` for each parameter and `@returns {type} text`
  (`@throws` where relevant). This is the JavaScript equivalent of Google-style docstrings.
- A `@typedef` defined in another file is referenced as `import('./watches.js').Watch`, never by
  its bare name (the linter rejects bare cross-file type names).
- Update JSDoc **in the same commit** as the code it describes.

### Build & test commands

- Install: `npm ci` (Node ≥ 22.13)
- Run tests: `npm test` — one file: `npx jest tests/lib/watches.test.js`
- With coverage (gate): `npm run test:coverage` — ≥ 95 % lines/statements/functions and ≥ 90 %
  branches over `src/**/*.js`
- Lint, including the JSDoc gate: `npm run lint` (auto-fix: `npm run lint:fix`)
- All checks: `npm run check`
- Package: `npm run package` → `dist/changedetection-extension-chrome-v<version>.zip`
- Version: `src/manifest.json` `version` is the source of truth; `package.json` `version` must
  match (the build script refuses to package otherwise).

### Workflow rules (non-negotiable)

- **TDD always**: write tests first, commit them, then implement.
  See `.claude/rules/tdd.md` for the full TDD protocol.
- **Coverage gate**: `npm run test:coverage` must pass the thresholds in `package.json`.
  Never lower them; add tests instead.
- **Never modify tests to make them pass** — fix the implementation or ask explicit confirmation if you are certain the error is in the test itself.
- Stage files explicitly (`git add <paths>`); never `git add -A`, `git add .` or `git commit -a`.

### Code conventions

- ES modules only, relative imports with the `.js` extension. The service worker is a module
  (`"type": "module"` in the manifest); pages load `<script type="module">`.
- Logging only through `createLogger(scope)` from `src/lib/log.js` (ESLint `no-console` enforces
  it). Levels: debug = sub-steps, info = one line per meaningful action, warn = degraded but
  continuing, error = the operation failed. Use `%s` / `%d` placeholders. Never log the API key,
  request headers or whole settings objects.
- Chrome APIs in promise style (`await chrome.storage.sync.get(...)`), never callbacks.
- Popup and options pages never call the server: they send a message (`ACTIONS` in
  `src/lib/messages.js`) to the service worker, which answers `{success, data}` or
  `{success: false, error, errorKind}`.
- API failures are `ApiError` (`src/lib/api.js`) with a user-safe message and a `kind`.
- `chrome.permissions.request(...)` must be called synchronously inside the click/submit
  handler, before any `await` (Chrome requires a user gesture).
- Build DOM with `createElement` + `textContent`; never put server or page data in `innerHTML`.
  Show/hide with the `hidden` attribute (the CSS makes `[hidden]` win), not `style.display`.

### Testing conventions

- Jest 30 + jsdom; ES modules are transpiled by babel-jest (config in `package.json`).
- `globalThis.chrome` is an in-memory fake (`tests/helpers/chrome-fake.js`) reset before every
  test; `fetch` is a fresh `jest.fn()` in every test; `console.*` is silenced and recorded —
  assert logs with `hasLog(level, pattern)` and `allLogText()` from `tests/helpers/logs.js`.
- Storage writes on the fake do not fire `chrome.storage.onChanged`; dispatch it explicitly.
- Load a page's markup with `loadHtml('src/popup/popup.html')` from `tests/helpers/dom.js`.

### Things to never do

- Do not add runtime dependencies, a bundler, `host_permissions` or content scripts. Server
  access is an optional host permission requested for the configured origin only.
- Do not create files outside `src/`, `tests/`, `docs/`, `scripts/`, `.vscode/`.
  Exempted, by explicit decision: `package.json`, `package-lock.json`, `eslint.config.mjs`,
  `.gitignore`, `README.md`, `LICENSE`, `CLAUDE.md` at the repo root.
- Do not run `git push` — I'll review and push manually.
- Do not use `console.*` outside `src/lib/log.js`, and never `eval` or `innerHTML` with data.
- Do not commit `dist/` or `coverage/`, and never hand-edit `package-lock.json`.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.
