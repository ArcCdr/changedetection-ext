# ChangeDetection.io Monitor — quality & feature plan (v1.1.0)

**Plan date:** 2026-09-28 · **Target version:** 1.1.0 (from 1.0.1) · **Cards:** 39 — 38 Haiku, 1 Sonnet (final validation), 0 Opus

## Decisions (settled in Phase 1)

1. **Layout:** `src/` is the unpacked extension (manifest, service worker, `popup/`, `options/`, `lib/`, `icons/`); `tests/` mirrors it; `scripts/` holds the build; `docs/` holds ARCHITECTURE and HISTORY.
2. **Tooling:** native ES modules (module service worker, `<script type="module">`); Jest 30 + babel-jest; ESLint 10 flat config with an `eslint-plugin-jsdoc` gate (the JS equivalent of the docstring gate) and `no-console` outside the logger; an in-memory `chrome` fake. The four replica test files are deleted (explicitly sanctioned) — they tested copies of the code, not the code.
3. **Host access (must keep working on the LAN):** `optional_host_permissions` for `http://*/*` + `https://*/*`; only the configured origin is requested — on Save / Test connection in the options page and via a "Grant access" button in the popup. Chrome's Local Network Access rules only let extensions reach LAN servers with host permission. The needless `tabs` permission is removed.
4. **Clicking a watch** opens `<server>/diff/<uuid>` and marks it viewed (one `PUT`); a ↗ link opens the monitored page; Ctrl/Cmd/middle-click opens a background tab and keeps the popup open. Never-changed watches open the monitored page.
5. **Badge:** unread count (`99+` cap). A single failed refresh keeps the previous badge; from the second failure in a row a grey `!` with the error in the tooltip.
6. **Features A–H:** Watch this page · per-watch error marker · instant popup from a session cache · Recheck all · filter box (≥ 10 watches) · dark mode + accessibility · Alt+Shift+D shortcut · opt-in desktop notifications. Not: tag filter.
7. **Docs:** short README + `docs/ARCHITECTURE.md` + `docs/HISTORY.md`; the four legacy root `*.md` files are removed; MIT `LICENSE` © 2025 ArcCdr.
8. **Version:** 1.1.0; `src/manifest.json` is the source of truth; the build refuses to package when `package.json` differs.
9. **Defaults:** changedetection.io ≥ 0.50.12; `last_viewed = max(now, last_changed)`; mark-all 4 requests at a time; connection test via `/api/v1/systeminfo` without saving; URL normalisation (http/https only, strip trailing `/` and a pasted `/api…`); 15 s timeout; friendly error messages, response bodies never shown; no requests while unconfigured; options page opens on first install; refresh alarm ensured at every service-worker start (watchdog removed); DOM built without `innerHTML`; title → page_title → URL fallback; unread-first sort; "Mark all viewed"; settings stay in `chrome.storage.sync`; coverage ≥ 95 % (branches ≥ 90 %); no CI; no Firefox.

## Baseline (measured 2026-09-28, before any card)

- JavaScript MV3 extension, manifest 1.0.1 / package.json 1.0.0; Node 22.19.0, npm 10.9.3. The previous `CLAUDE.md` described a Python project; `CLAUDE.md`, `.claude/rules/tdd.md` and `.PROMPTS/TIERED_TASK_PROMPT.md` were rewritten for this repo at planning time (Phase-1 answer 1).
- `npx jest`: 4 suites, **35 passed**, **0 % coverage of production code** (every test file re-declares its own copy of the code).
- `npm run lint` (`eslint *.js`, ESLint 8.57.1): 0 problems on root files; test files are not linted (6 errors when included).
- `npm audit`: no runtime dependencies; **42 dev-dependency vulnerabilities (7 critical)**, via `web-ext@7` and `jest@27`.
- No JSDoc gate, no coverage gate, `dist/` never cleaned (stale `content.js` shipped), version drift between manifest, package.json and zip name.
- Periodic gates: dependencies change in TASK-2 and TASK-3 → TASK-39 re-runs `npm audit` (planning run: 0 vulnerabilities). No container config.

## How to run

- Node ≥ 22.13 (required by ESLint 10 and `eslint-plugin-jsdoc` 63). TASK-1 runs on the existing `node_modules`; TASK-2 and TASK-3 install the new toolchain with the exact commands in their cards.
- The runner's auto gate needs a `.venv` and would silently skip every gate here. Run the batch with `CRT_GATE='npm run lint && npm test'` — every card was dry-run green under exactly this gate.
- The prompt template is `.PROMPTS/TIERED_TASK_PROMPT.md` (JavaScript version).
- `.PROMPTS/`, `.claude/` and `CLAUDE.md` are untracked and must stay uncommitted: every card stages explicit paths.
- After the batch: run the manual LAN smoke test listed in TASK-39 (the planning smoke test used a fake server).

## Planning-time verification

- Every card's code and tests were executed in order at planning time: TASK-1…3 on a real clone with the real `npm` commands, TASK-4…38 on a simulated tree. For each card the new tests fail first, then `eslint .` and the **full** `npm test` pass. End state: **243 tests**, coverage **99.8 % statements / 97.2 % branches / 100 % functions / 100 % lines**, `npm audit` 0 vulnerabilities, `node scripts/build.mjs` builds `changedetection-extension-chrome-v1.1.0.zip`.
- The end state was loaded in headless Chromium against a fake changedetection.io API: the module service worker starts, the badge counts only genuinely unread watches, the popup renders and opens diffs, marking viewed sends one `PUT`, Test connection reports the server version, with zero console errors or warnings.
- For builders: the code blocks in the cards are the verified implementation — copy them exactly.

## Card index

| # | Title | Tier |
|---|-------|------|
| 1 | Move the extension into src/ and delete dead files | Haiku |
| 2 | Jest 30 + Babel test toolchain with an in-memory chrome fake | Haiku |
| 3 | ESLint 10 flat config with JSDoc and logging gates | Haiku |
| 4 | Release metadata: 1.1.0 manifest, permissions, shortcut, LICENSE | Haiku |
| 5 | Logger facade (src/lib/log.js) | Haiku |
| 6 | Relative time formatting (src/lib/format.js) | Haiku |
| 7 | Watch list normalisation and the correct unread rule | Haiku |
| 8 | Watch display helpers: title, links, sort order | Haiku |
| 9 | Watch filter and find-by-URL helpers | Haiku |
| 10 | Settings validation and URL normalisation | Haiku |
| 11 | Settings loading and host-permission helpers | Haiku |
| 12 | API client core: timeouts, error mapping, safe logging | Haiku |
| 13 | API client endpoints (single-PUT mark viewed) | Haiku |
| 14 | Toolbar badge states: count, error, cleared | Haiku |
| 15 | Refresh alarm scheduler without watchdog | Haiku |
| 16 | Session watch cache | Haiku |
| 17 | Message contract module | Haiku |
| 18 | Opt-in change notifications module | Haiku |
| 19 | Refresh cycle with failure counter | Haiku |
| 20 | Service-worker actions: open watch, mark all viewed | Haiku |
| 21 | Service-worker actions: test connection, add watch, recheck all | Haiku |
| 22 | Service worker rewrite part 1: message router | Haiku |
| 23 | Service worker rewrite part 2: lifecycle, alarms, notifications | Haiku |
| 24 | Popup watch row builder | Haiku |
| 25 | Popup markup and styles (dark mode, accessibility) | Haiku |
| 26 | Popup controller core rewrite | Haiku |
| 27 | Popup: open watches (diff, background tabs) | Haiku |
| 28 | Popup: mark all viewed | Haiku |
| 29 | Popup: instant render from cache | Haiku |
| 30 | Popup: grant server access | Haiku |
| 31 | Popup: recheck all | Haiku |
| 32 | Popup: filter box | Haiku |
| 33 | Popup: watch this page | Haiku |
| 34 | Options markup and styles | Haiku |
| 35 | Options controller core rewrite | Haiku |
| 36 | Options: test connection without saving | Haiku |
| 37 | Options: notifications opt-in | Haiku |
| 38 | Build script and lint clean-up | Haiku |
| 39 | Documentation, full verification and whole-plan review | Sonnet |

---
### TASK-1: Move the extension into src/ and delete dead files
**Type:** Refactor
**Priority:** High
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** manifest.json → src/manifest.json, background.js → src/background.js, popup.html/js/css → src/popup/, options.html/js/css → src/options/, icons/ → src/icons/, content.js (delete), background-test.js (delete), package.json

**Current State**
All extension files sit at the repository root next to tooling. `npm run build:chrome` copies a hand-maintained file list into `dist/` without cleaning it (a stale `content.js` still ships in the zip), and `package:chrome` hard-codes `v1.0.0` in the zip name while the manifest says 1.0.1. `content.js` is dead: the manifest stopped loading it in 1.0.1 ("Hardened permissions"). `background-test.js` is a leftover Firefox probe that nothing references. The tests in `__tests__/` do not import any source file, so moving files cannot break them.

**Target State**
- `src/` is the unpacked extension (Chrome: "Load unpacked" → `src/`): `src/manifest.json`, `src/background.js`, `src/popup/{popup.html,popup.js,popup.css}`, `src/options/{options.html,options.js,options.css}`, `src/icons/*.png`.
- `src/manifest.json` points to `popup/popup.html` and `options/options.html`; icon paths (`icons/iconN.png`) stay valid because they are relative to `src/`.
- `content.js` and `background-test.js` are deleted.
- `package.json` scripts are exactly `test`, `test:watch`, `lint` (`eslint src`), `lint:fix`; the old build/package scripts are removed (a new build script arrives in a later task). Code is moved unchanged.

**Test Specification** (write these FIRST — the TDD contract)
No new tests: this task moves files without changing behaviour (TDD exemption for a pure move). Verification: the 35 existing tests in `__tests__/` still pass and `npm run lint` is clean.

**Implementation Steps**
1. Run: `mkdir -p src/popup src/options`
2. Run: `git mv manifest.json src/manifest.json`
3. Run: `git mv background.js src/background.js`
4. Run: `git mv popup.html popup.js popup.css src/popup/`
5. Run: `git mv options.html options.js options.css src/options/`
6. Run: `git mv icons src/icons`
7. Run: `git rm content.js background-test.js`
8. In `src/manifest.json`, replace this exact text (it occurs exactly once):

```json
"default_popup": "popup.html",
```

with:

```json
"default_popup": "popup/popup.html",
```
9. In `src/manifest.json`, replace this exact text (it occurs exactly once):

```json
"options_page": "options.html",
```

with:

```json
"options_page": "options/options.html",
```
10. In `package.json`, replace this exact text (it occurs exactly once):

```json
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint *.js",
    "lint:fix": "eslint *.js --fix",
    "build": "npm run lint && npm test && npm run build:chrome",
    "build:chrome": "mkdir -p dist && cp manifest.json background.js popup.html popup.js popup.css options.html options.js options.css dist/ && cp -r icons dist/",
    "package": "npm run package:chrome",
    "package:chrome": "npm run build:chrome && cd dist && zip -r changedetection-extension-chrome-v1.0.0.zip . -x '*.DS_Store' '*.git*'",
    "dev:chrome": "echo 'Chrome: Load dist/ directory -> chrome://extensions/ -> Enable Developer mode -> Load unpacked -> select dist/ directory'",
    "chrome-setup": "git checkout manifest.json 2>/dev/null || echo 'Using default Chrome manifest'"
  },
```

with:

```json
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src",
    "lint:fix": "eslint src --fix"
  },
```
11. Run `npx jest` — it must report 4 suites and 35 passed tests (the legacy tests are unchanged).
12. Light checks: `npm run lint` must exit 0. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
13. Commit: `git add src/manifest.json package.json && git commit -m "refactor: move extension sources into src/ and drop dead files"`

**Context for Implementor**
- `popup.html` / `options.html` reference `popup.css`, `popup.js`, `options.css`, `options.js` by relative name; they move together, so do not edit the HTML.
- `git mv` / `git rm` stage the moves and deletions; the final commit also stages the two edited files.
- Do not change any code, do not convert anything to ES modules, do not touch `README.md` or the other `*.md` files, `dist/` (gitignored build output) or `__tests__/`.
- ESLint is still version 8 with the `eslintConfig` block in `package.json`; `eslint src` lints the moved files with that config.

**Acceptance Criteria**
- [ ] `git status` shows the moves as renames and `content.js`, `background-test.js` as deleted.
- [ ] `node -e "const m=require('./src/manifest.json'); console.log(m.action.default_popup, m.options_page)"` prints `popup/popup.html options/options.html`.
- [ ] `npx jest` → 4 suites, 35 tests passed.
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 35 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-2: Jest 30 + Babel test toolchain with an in-memory chrome fake
**Type:** Refactor
**Priority:** Critical
**Effort:** Medium (1–2 h)
**Tier:** Haiku
**Files:** package.json, package-lock.json, .gitignore, __tests__/*.test.js (delete all 4), tests/helpers/chrome-fake.js, tests/helpers/install-chrome.js, tests/helpers/test-setup.js, tests/helpers/dom.js, tests/helpers/logs.js, tests/helpers/chrome-fake.test.js

**Current State**
The four files in `__tests__/` re-declare their own copies of `ChangeDetectionAPI`, `PopupManager`, `OptionsManager` and helper functions and test those copies, so production code has 0 % coverage; the copies have drifted (they expect `PATCH` and ISO dates, production sends `GET`+`PUT` with Unix seconds). Tooling is Jest 27 with `jest-chrome` (configured but unused — every test overwrites `global.chrome`) and `web-ext` (unused since Firefox support was dropped); these two are the source of most of the 42 dev-dependency audit findings.

**Target State**
- Dev dependencies: `jest@30.5.2`, `jest-environment-jsdom@30.5.2`, `@babel/core@7.29.7`, `@babel/preset-env@7.29.7` (exact versions); `jest-chrome` and `web-ext` removed. `eslint` stays at ^8 until the next task.
- `package.json`: script `test:coverage` = `jest --coverage`; a `"babel"` block (preset-env targeting the current Node, so tests can import the ES-module sources); a `"jest"` block with `testEnvironment: jsdom`, `roots: ["<rootDir>/tests"]`, `setupFiles` = `tests/helpers/install-chrome.js`, `setupFilesAfterEnv` = `tests/helpers/test-setup.js`, `collectCoverageFrom: ["src/**/*.js"]` and a global `coverageThreshold` of branches 90 / functions 95 / lines 95 / statements 95 (enforced only by `npm run test:coverage`).
- `.gitignore` ignores `coverage/`.
- The four replica test files are deleted — **explicitly sanctioned by this plan** (the repo rule "never modify tests" does not apply: they test nothing real and are replaced by real tests in later tasks).
- New helpers: `chrome-fake.js` (`createChromeFake()`), `install-chrome.js`, `test-setup.js`, `dom.js` (`loadHtml`, `flushPromises`), `logs.js` (`logLines`, `hasLog`, `allLogText`).

**Test Specification** (write these FIRST — the TDD contract)
`tests/helpers/chrome-fake.test.js` checks the fake and the log helpers themselves: storage round-trips and returns copies; `remove`/`clear`; alarms kept until cleared; `_reset()` empties state but keeps event listeners and `dispatch()` returns listener results; permissions default to granted and accept `mockResolvedValueOnce(false)`; `logLines` renders `%s`/`%d`.
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/helpers/chrome-fake.test.js` › chrome fake › storage round-trips values and returns only requested keys
- `tests/helpers/chrome-fake.test.js` › chrome fake › storage returns copies, not live references
- `tests/helpers/chrome-fake.test.js` › chrome fake › storage remove and clear delete keys
- `tests/helpers/chrome-fake.test.js` › chrome fake › alarms keep created alarms until cleared
- `tests/helpers/chrome-fake.test.js` › chrome fake › _reset empties state but keeps event listeners
- `tests/helpers/chrome-fake.test.js` › chrome fake › permissions default to granted and can be overridden once
- `tests/helpers/chrome-fake.test.js` › log helpers › logLines renders placeholders

**Implementation Steps**
1. Run: `npm uninstall jest-chrome web-ext`
2. Run: `npm install --save-dev --save-exact jest@30.5.2 jest-environment-jsdom@30.5.2 @babel/core@7.29.7 @babel/preset-env@7.29.7`
3. In `package.json`, replace this exact text (it occurs exactly once):

```json
    "test:watch": "jest --watch",
```

with:

```json
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
```
4. In `package.json`, replace this exact text (it occurs exactly once):

```json
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": [
      "jest-chrome"
    ],
    "testMatch": [
      "**/__tests__/**/*.test.js"
    ]
  },
```

with:

```json
  "babel": {
    "presets": [
      [
        "@babel/preset-env",
        {
          "targets": {
            "node": "current"
          }
        }
      ]
    ]
  },
  "jest": {
    "testEnvironment": "jsdom",
    "roots": [
      "<rootDir>/tests"
    ],
    "setupFiles": [
      "<rootDir>/tests/helpers/install-chrome.js"
    ],
    "setupFilesAfterEnv": [
      "<rootDir>/tests/helpers/test-setup.js"
    ],
    "collectCoverageFrom": [
      "src/**/*.js"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 90,
        "functions": 95,
        "lines": 95,
        "statements": 95
      }
    }
  },
```
5. In `.gitignore`, replace this exact text (it occurs exactly once):

```text
dist/
```

with:

```text
dist/
coverage/
```
6. Write the tests. Create `tests/helpers/chrome-fake.test.js` with exactly this content:

```js
import { createChromeFake } from './chrome-fake.js';
import { allLogText, hasLog, logLines } from './logs.js';

describe('chrome fake', () => {
  test('storage round-trips values and returns only requested keys', async () => {
    await chrome.storage.sync.set({ baseURL: 'http://a', apiKey: 'k' });
    expect(await chrome.storage.sync.get(['baseURL'])).toEqual({ baseURL: 'http://a' });
    expect(await chrome.storage.sync.get('apiKey')).toEqual({ apiKey: 'k' });
    expect(await chrome.storage.sync.get(null)).toEqual({ baseURL: 'http://a', apiKey: 'k' });
  });

  test('storage returns copies, not live references', async () => {
    await chrome.storage.session.set({ list: [1] });
    const { list } = await chrome.storage.session.get('list');
    list.push(2);
    expect(await chrome.storage.session.get('list')).toEqual({ list: [1] });
  });

  test('storage remove and clear delete keys', async () => {
    await chrome.storage.local.set({ a: 1, b: 2 });
    await chrome.storage.local.remove('a');
    expect(await chrome.storage.local.get(null)).toEqual({ b: 2 });
    await chrome.storage.local.clear();
    expect(await chrome.storage.local.get(null)).toEqual({});
  });

  test('alarms keep created alarms until cleared', async () => {
    await chrome.alarms.create('x', { periodInMinutes: 5 });
    expect(await chrome.alarms.get('x')).toEqual({ name: 'x', periodInMinutes: 5 });
    expect(await chrome.alarms.clear('x')).toBe(true);
    expect(await chrome.alarms.get('x')).toBeUndefined();
  });

  test('_reset empties state but keeps event listeners', async () => {
    const fake = createChromeFake();
    const listener = jest.fn(() => 'result');
    fake.runtime.onMessage.addListener(listener);
    await fake.storage.sync.set({ a: 1 });
    fake._reset();
    expect(await fake.storage.sync.get(null)).toEqual({});
    expect(fake.runtime.onMessage.hasListener(listener)).toBe(true);
    expect(fake.runtime.onMessage.dispatch('msg')).toEqual(['result']);
    expect(listener).toHaveBeenCalledWith('msg');
  });

  test('permissions default to granted and can be overridden once', async () => {
    chrome.permissions.request.mockResolvedValueOnce(false);
    expect(await chrome.permissions.request({ origins: ['http://a/*'] })).toBe(false);
    expect(await chrome.permissions.request({ origins: ['http://a/*'] })).toBe(true);
    expect(await chrome.permissions.contains({ origins: ['http://a/*'] })).toBe(true);
  });
});

describe('log helpers', () => {
  test('logLines renders placeholders', () => {
    console.info('[cdio:x] Did %s with %d items', 'thing', 3);
    expect(logLines('info')).toEqual(['[cdio:x] Did thing with 3 items']);
    expect(hasLog('info', /Did thing with \d items/)).toBe(true);
    expect(hasLog('warn', 'Did')).toBe(false);
    expect(allLogText()).toContain('Did thing');
  });
});
```
7. Run `npx jest tests/helpers/chrome-fake.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
8. Commit only the test files: `git add tests/helpers/chrome-fake.test.js && git commit -m "test: add self-tests for the chrome fake and log helpers"`
9. Run: `git rm __tests__/background.test.js __tests__/options.test.js __tests__/popup.test.js __tests__/utilities.test.js`
10. Create `tests/helpers/chrome-fake.js` with exactly this content:

```js
/**
 * @file In-memory fake of the `chrome.*` extension APIs used by this project.
 *
 * Every API method is a `jest.fn()` with a realistic default implementation
 * (promise style, like Manifest V3). Storage areas and alarms keep real
 * in-memory state so reads observe earlier writes. Events keep their listeners
 * across `_reset()` so modules that register listeners at import time stay
 * wired for every test in the file.
 *
 * Storage writes do NOT dispatch `chrome.storage.onChanged` automatically;
 * tests call `chrome.storage.onChanged.dispatch(changes, areaName)` explicitly.
 */

/**
 * Deep-copy a JSON-compatible value (jsdom has no structuredClone).
 *
 * @param {*} value - Value to copy.
 * @returns {*} An independent copy.
 */
function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

/**
 * Create a fake `chrome.events.Event`.
 *
 * @returns {{addListener: Function, removeListener: Function, hasListener: Function,
 *   hasListeners: Function, dispatch: Function, listeners: Function[]}} The event object.
 */
function createEvent() {
  const listeners = [];
  return {
    listeners,
    addListener: (fn) => {
      listeners.push(fn);
    },
    removeListener: (fn) => {
      const index = listeners.indexOf(fn);
      if (index !== -1) listeners.splice(index, 1);
    },
    hasListener: (fn) => listeners.includes(fn),
    hasListeners: () => listeners.length > 0,
    dispatch: (...args) => listeners.map((fn) => fn(...args)),
  };
}

/**
 * Create a fake `chrome.storage.StorageArea` backed by a plain object.
 *
 * @param {object} data - Mutable backing store for this area.
 * @returns {object} Storage area with jest.fn get/set/remove/clear.
 */
function createStorageArea(data) {
  return {
    get: jest.fn(async (keys) => {
      if (keys === null || keys === undefined) return { ...data };
      const list = typeof keys === 'string' ? [keys] : Array.isArray(keys) ? keys : Object.keys(keys);
      const defaults = typeof keys === 'object' && !Array.isArray(keys) ? keys : {};
      const result = {};
      for (const key of list) {
        if (key in data) result[key] = clone(data[key]);
        else if (key in defaults) result[key] = defaults[key];
      }
      return result;
    }),
    set: jest.fn(async (items) => {
      for (const [key, value] of Object.entries(items)) data[key] = clone(value);
    }),
    remove: jest.fn(async (keys) => {
      for (const key of typeof keys === 'string' ? [keys] : keys) delete data[key];
    }),
    clear: jest.fn(async () => {
      for (const key of Object.keys(data)) delete data[key];
    }),
  };
}

/**
 * (Re)install every API method on the fake with fresh mocks and empty state.
 *
 * @param {object} fake - The fake chrome object to populate.
 */
function installApis(fake) {
  const alarms = new Map();
  fake._storage = { sync: {}, local: {}, session: {} };
  fake.storage.sync = createStorageArea(fake._storage.sync);
  fake.storage.local = createStorageArea(fake._storage.local);
  fake.storage.session = createStorageArea(fake._storage.session);

  fake.runtime.sendMessage = jest.fn(async () => undefined);
  fake.runtime.openOptionsPage = jest.fn(async () => undefined);
  fake.runtime.getManifest = jest.fn(() => ({ version: '0.0.0-test' }));
  fake.runtime.getURL = jest.fn((path) => `chrome-extension://test-id/${path}`);

  fake.action.setBadgeText = jest.fn(async () => undefined);
  fake.action.setBadgeBackgroundColor = jest.fn(async () => undefined);
  fake.action.setTitle = jest.fn(async () => undefined);

  fake.alarms.create = jest.fn(async (name, info) => {
    alarms.set(name, { name, ...info });
  });
  fake.alarms.get = jest.fn(async (name) => alarms.get(name));
  fake.alarms.getAll = jest.fn(async () => [...alarms.values()]);
  fake.alarms.clear = jest.fn(async (name) => alarms.delete(name));

  fake.tabs.create = jest.fn(async (props) => ({ id: 1, ...props }));
  fake.tabs.query = jest.fn(async () => []);

  fake.permissions.contains = jest.fn(async () => true);
  fake.permissions.request = jest.fn(async () => true);

  fake.notifications.create = jest.fn(async (id) => id);
  fake.notifications.clear = jest.fn(async () => true);
}

/**
 * Build a complete fake `chrome` namespace.
 *
 * @returns {object} The fake, with a `_reset()` method that restores fresh
 *   mocks and empty state while keeping registered event listeners.
 */
export function createChromeFake() {
  const fake = {
    storage: { onChanged: createEvent() },
    runtime: { onMessage: createEvent(), onStartup: createEvent(), onInstalled: createEvent() },
    action: {},
    alarms: { onAlarm: createEvent() },
    tabs: {},
    permissions: { onAdded: createEvent() },
    idle: { onStateChanged: createEvent() },
    notifications: { onClicked: createEvent() },
  };
  fake._reset = () => installApis(fake);
  fake._reset();
  return fake;
}
```
11. Create `tests/helpers/install-chrome.js` with exactly this content:

```js
/**
 * @file Jest `setupFiles` entry: installs a fresh chrome fake before each test file loads.
 */
import { createChromeFake } from './chrome-fake.js';

globalThis.chrome = createChromeFake();
```
12. Create `tests/helpers/test-setup.js` with exactly this content:

```js
/**
 * @file Jest `setupFilesAfterEnv` entry: before each test, reset the chrome fake, replace
 * fetch with a fresh mock and silence (but record) console output; restore spies after.
 */
beforeEach(() => {
  globalThis.chrome._reset();
  globalThis.fetch = jest.fn();
  for (const level of ['debug', 'info', 'warn', 'error']) {
    jest.spyOn(console, level).mockImplementation(() => {});
  }
});

afterEach(() => {
  jest.restoreAllMocks();
});
```
13. Create `tests/helpers/dom.js` with exactly this content:

```js
/**
 * @file DOM helpers for tests of extension pages.
 */
import fs from 'node:fs';
import path from 'node:path';

/**
 * Replace the jsdom document with the markup of an extension HTML page (scripts are not executed).
 *
 * @param {string} relativePath - Path of the HTML file relative to the repository root, e.g. 'src/popup/popup.html'.
 */
export function loadHtml(relativePath) {
  const html = fs.readFileSync(path.join(__dirname, '..', '..', relativePath), 'utf8');
  document.documentElement.innerHTML = html.replace(/<!DOCTYPE html>/i, '');
}

/**
 * Wait for all pending promise callbacks and timers-free microtasks to run.
 *
 * @returns {Promise<void>} Resolves after the microtask queue drains.
 */
export function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
```
14. Create `tests/helpers/logs.js` with exactly this content:

```js
/**
 * @file Helpers to assert on log output captured by the console spies in test-setup.js.
 */

/**
 * Render the recorded console calls of one level as text, substituting %s / %d placeholders.
 *
 * @param {'debug'|'info'|'warn'|'error'} level - Console method.
 * @returns {string[]} One rendered line per call.
 */
export function logLines(level) {
  return console[level].mock.calls.map(([message, ...args]) => {
    const rest = [...args];
    const text = String(message).replace(/%[sdifoO]/g, () => String(rest.shift()));
    return [text, ...rest.map(String)].join(' ');
  });
}

/**
 * Whether any recorded line of a level matches.
 *
 * @param {'debug'|'info'|'warn'|'error'} level - Console method.
 * @param {string|RegExp} pattern - Substring or regular expression.
 * @returns {boolean} True when at least one line matches.
 */
export function hasLog(level, pattern) {
  return logLines(level).some((line) => (pattern instanceof RegExp ? pattern.test(line) : line.includes(pattern)));
}

/**
 * All recorded log lines of every level, joined with newlines.
 *
 * @returns {string} Text of every log call.
 */
export function allLogText() {
  return ['debug', 'info', 'warn', 'error'].flatMap(logLines).join('\n');
}
```
15. Light checks: `npm run lint` must exit 0, then `npx jest tests/helpers/chrome-fake.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
16. Commit: `git add package.json package-lock.json .gitignore tests/helpers/chrome-fake.js tests/helpers/install-chrome.js tests/helpers/test-setup.js tests/helpers/dom.js tests/helpers/logs.js && git commit -m "build: switch to Jest 30 + Babel with an in-memory chrome fake"`

**Context for Implementor**
- Order matters: install and configure first, then write the self-test (it fails because the setup file and the fake do not exist yet), commit it, then create the helpers. The `git rm` of `__tests__/` is staged and goes into the final commit.
- Fake semantics later tasks rely on: every API method is a `jest.fn()` with a promise-style default (storage/alarms keep in-memory state; `permissions.contains`/`request` resolve `true`; `runtime.getManifest()` returns `{version: '0.0.0-test'}`; `runtime.getURL(p)` returns `chrome-extension://test-id/<p>`; `tabs.create` resolves `{id: 1, ...props}`; `tabs.query` resolves `[]`). Storage writes do **not** fire `chrome.storage.onChanged` — tests dispatch it. Event objects (`onMessage`, `onInstalled`, `onStartup`, `onAlarm`, `idle.onStateChanged`, `storage.onChanged`, `permissions.onAdded`, `notifications.onClicked`) keep listeners across `_reset()` so modules that register listeners at import stay wired.
- `test-setup.js` also replaces `globalThis.fetch` with a fresh `jest.fn()` and silences/records `console.debug/info/warn/error` before every test; `jest.restoreAllMocks()` runs after each test.
- jsdom has no `structuredClone`; the fake copies values with JSON — keep that.
- Do not add `jest-chrome` back, do not upgrade ESLint here, do not touch `src/`.

**Acceptance Criteria**
- [ ] `ls __tests__` fails (directory gone).
- [ ] `npm ls jest-chrome web-ext` lists neither package.
- [ ] `npx jest` → 1 suite (`tests/helpers/chrome-fake.test.js`), 7 tests passed.
- [ ] `npx jest tests/helpers/chrome-fake.test.js` passes (7 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 7 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-3: ESLint 10 flat config with JSDoc and logging gates
**Type:** Refactor
**Priority:** High
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** package.json, eslint.config.mjs

**Current State**
Linting uses ESLint 8 (end of life) through an `eslintConfig` block in `package.json`, covers only `src/`, never lints `tests/`, and nothing enforces documentation or the logging facade.

**Target State**
- Dev dependencies: `eslint@10.11.0`, `@eslint/js@10.0.1`, `globals@17.12.0`, `eslint-plugin-jsdoc@63.3.3` (exact versions; 63.x because 64.x requires Node ≥ 22.22.2).
- `package.json`: the `eslintConfig` block is removed; `lint` = `eslint .`, `lint:fix` = `eslint . --fix`.
- New `eslint.config.mjs` (flat config): recommended rules everywhere; browser + webextension globals for `src/`, jest + node globals for `tests/`, node globals for `scripts/`; JSDoc required (file overview, description, params, returns; blank line after the description) on `src/**/*.js` and `scripts/**/*.mjs`; `no-console` on `src/` except `src/lib/log.js`.
- `LEGACY_FILES` = `['src/background.js', 'src/popup/popup.js', 'src/options/options.js']` are exempt from the JSDoc, `no-console` and `no-unused-vars` rules until the tasks that rewrite them remove their entry. The legacy block is spread conditionally because ESLint throws on `files: []`.

**Test Specification** (write these FIRST — the TDD contract)
No unit tests (tooling-only task). Verification: `npm run lint` exits 0 on the current tree, and a deliberately undocumented file is rejected (step below).

**Implementation Steps**
1. Run: `npm uninstall eslint`
2. Run: `npm install --save-dev --save-exact eslint@10.11.0 @eslint/js@10.0.1 globals@17.12.0 eslint-plugin-jsdoc@63.3.3`
3. In `package.json`, replace this exact text (it occurs exactly once):

```json
  },
  "eslintConfig": {
    "env": {
      "browser": true,
      "es2021": true,
      "webextensions": true,
      "jest": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
      "ecmaVersion": 2021,
      "sourceType": "module"
    },
    "rules": {
      "no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_"
        }
      ],
      "no-console": "off"
    },
    "globals": {
      "chrome": "readonly"
    }
  }
}
```

with:

```json
  }
}
```
4. In `package.json`, replace this exact text (it occurs exactly once):

```json
    "lint": "eslint src",
    "lint:fix": "eslint src --fix"
```

with:

```json
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
```
5. Create `eslint.config.mjs` with exactly this content:

```js
/**
 * @file ESLint flat config: recommended rules everywhere; JSDoc and logging-facade rules on
 * shipped code (src/) and repo scripts (scripts/).
 */
import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';

// Pre-refactor files, exempt from the JSDoc, no-console and no-unused-vars rules until they
// are rewritten. Each rewrite task removes its own entry; the list must end up empty.
const LEGACY_FILES = ['src/background.js', 'src/popup/popup.js', 'src/options/options.js'];

export default [
  { ignores: ['dist/', 'coverage/', 'node_modules/'] },
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module' },
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }] },
  },
  {
    files: ['src/**/*.js'],
    languageOptions: { globals: { ...globals.browser, ...globals.webextensions } },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: { globals: { ...globals.browser, ...globals.webextensions, ...globals.node, ...globals.jest } },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    ...jsdoc.configs['flat/recommended-error'],
    files: ['src/**/*.js', 'scripts/**/*.mjs'],
    ignores: LEGACY_FILES,
  },
  {
    files: ['src/**/*.js', 'scripts/**/*.mjs'],
    ignores: LEGACY_FILES,
    rules: {
      'jsdoc/require-file-overview': 'error',
      'jsdoc/require-description': 'error',
      'jsdoc/require-jsdoc': [
        'error',
        { require: { FunctionDeclaration: true, MethodDefinition: true, ClassDeclaration: true } },
      ],
      'jsdoc/tag-lines': ['error', 'any', { startLines: 1 }],
      'jsdoc/reject-function-type': 'off',
      'jsdoc/reject-any-type': 'off',
    },
  },
  {
    files: ['src/**/*.js'],
    ignores: [...LEGACY_FILES, 'src/lib/log.js'],
    rules: { 'no-console': 'error' },
  },
  ...(LEGACY_FILES.length > 0 ? [{ files: LEGACY_FILES, rules: { 'no-unused-vars': 'off' } }] : []),
];
```
6. Prove the gate works, then clean up: `printf 'export function f(a) { console.log(a); }\n' > src/lint-probe.js; npx eslint src/lint-probe.js; echo "exit=$?"; rm src/lint-probe.js` — the output must list `jsdoc/require-file-overview`, `jsdoc/require-jsdoc` and `no-console`, and print `exit=1`.
7. Light checks: `npm run lint` must exit 0. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
8. Commit: `git add package.json package-lock.json eslint.config.mjs && git commit -m "build: migrate to ESLint 10 flat config with JSDoc and no-console gates"`

**Context for Implementor**
- ESLint 9+ reports unused `catch (e)` bindings by default; the three legacy files have such bindings, which is why `no-unused-vars` is off for `LEGACY_FILES` only.
- Later tasks edit exactly one line of this file (the `LEGACY_FILES` array) — keep the constant name and formatting as given.
- `dist/`, `coverage/` and `node_modules/` are ignored. Do not add rules, plugins or Prettier.

**Acceptance Criteria**
- [ ] The probe in the steps printed the three rule names and `exit=1`, and `src/lint-probe.js` no longer exists.
- [ ] `grep -c eslintConfig package.json` prints `0`.
- [ ] `npx jest` → 7 tests passed.
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 7 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-4: Release metadata: 1.1.0 manifest, permissions, shortcut, LICENSE
**Type:** Inconsistency
**Priority:** High
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/manifest.test.js, src/manifest.json, package.json, LICENSE

**Current State**
`src/manifest.json` is 1.0.1 while `package.json` is 1.0.0. Permissions: `optional_permissions: ["tabs"]` is useless (`chrome.tabs.create` needs no permission) but makes the popup show a "read your browsing history" prompt; there are no host permissions at all, so on Chrome 142+ (Local Network Access) the service worker may be blocked from the user's changedetection.io server on the LAN. The service worker is a classic script (no ES modules), there is no keyboard shortcut and no minimum Chrome version. `package.json` has `"author": "Your Name"` and a stale `"main": "background.js"`; README mentions a LICENSE file that does not exist.

**Target State**
- `src/manifest.json`: `version` `1.1.0`; `minimum_chrome_version` `120`; `permissions` `["storage", "alarms", "idle", "activeTab"]`; `optional_permissions` `["notifications"]`; `optional_host_permissions` `["http://*/*", "https://*/*"]`; no `host_permissions`, no `content_scripts`; `background` `{service_worker: "background.js", type: "module"}`; `commands._execute_action.suggested_key.default` `Alt+Shift+D`.
- `package.json`: `version` `1.1.0`, `"private": true`, description `Chrome extension to monitor changedetection.io watches`, `author` `ArcCdr`, no `main`.
- `LICENSE`: MIT, "Copyright (c) 2025 ArcCdr".

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/manifest.test.js` › manifest.json › is Manifest V3 with the same version as package.json
- `tests/manifest.test.js` › manifest.json › requests only the expected permissions
- `tests/manifest.test.js` › manifest.json › uses a module service worker
- `tests/manifest.test.js` › manifest.json › declares the popup shortcut
- `tests/manifest.test.js` › manifest.json › every referenced file exists in src/

**Implementation Steps**
1. Write the tests. Create `tests/manifest.test.js` with exactly this content:

```js
import fs from 'node:fs';
import path from 'node:path';

const root = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'src/manifest.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

describe('manifest.json', () => {
  test('is Manifest V3 with the same version as package.json', () => {
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.version).toBe('1.1.0');
    expect(pkg.version).toBe(manifest.version);
    expect(manifest.minimum_chrome_version).toBe('120');
  });

  test('requests only the expected permissions', () => {
    expect(manifest.permissions).toEqual(['storage', 'alarms', 'idle', 'activeTab']);
    expect(manifest.optional_permissions).toEqual(['notifications']);
    expect(manifest.optional_host_permissions).toEqual(['http://*/*', 'https://*/*']);
    expect(manifest.host_permissions).toBeUndefined();
    expect(manifest.content_scripts).toBeUndefined();
  });

  test('uses a module service worker', () => {
    expect(manifest.background).toEqual({ service_worker: 'background.js', type: 'module' });
  });

  test('declares the popup shortcut', () => {
    expect(manifest.commands._execute_action.suggested_key.default).toBe('Alt+Shift+D');
  });

  test('every referenced file exists in src/', () => {
    const files = [
      manifest.background.service_worker,
      manifest.action.default_popup,
      manifest.options_page,
      ...Object.values(manifest.icons),
      ...Object.values(manifest.action.default_icon),
    ];
    for (const file of files) expect(fs.existsSync(path.join(root, 'src', file))).toBe(true);
  });
});
```
2. Run `npx jest tests/manifest.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/manifest.test.js && git commit -m "test: pin manifest version, permissions, module worker and shortcut"`
4. Replace the entire content of `src/manifest.json` with exactly:

```json
{
  "manifest_version": 3,
  "name": "ChangeDetection.io Monitor",
  "version": "1.1.0",
  "description": "Monitor your changedetection.io watches directly from your browser",
  "minimum_chrome_version": "120",
  "permissions": ["storage", "alarms", "idle", "activeTab"],
  "optional_permissions": ["notifications"],
  "optional_host_permissions": ["http://*/*", "https://*/*"],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "action": {
    "default_popup": "popup/popup.html",
    "default_title": "ChangeDetection.io Monitor",
    "default_icon": {
      "16": "icons/icon16.png",
      "24": "icons/icon24.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "64": "icons/icon64.png",
      "128": "icons/icon128.png"
    }
  },
  "options_page": "options/options.html",
  "commands": {
    "_execute_action": {
      "suggested_key": { "default": "Alt+Shift+D" },
      "description": "Open the watch list"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "24": "icons/icon24.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "64": "icons/icon64.png",
    "128": "icons/icon128.png"
  }
}
```
5. In `package.json`, replace this exact text (it occurs exactly once):

```json
  "version": "1.0.0",
  "description": "Browser extension to monitor changedetection.io watches",
  "main": "background.js",
```

with:

```json
  "version": "1.1.0",
  "private": true,
  "description": "Chrome extension to monitor changedetection.io watches",
```
6. In `package.json`, replace this exact text (it occurs exactly once):

```json
  "author": "Your Name",
```

with:

```json
  "author": "ArcCdr",
```
7. Create `LICENSE` with exactly this content:

```text
MIT License

Copyright (c) 2025 ArcCdr

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
8. Light checks: `npm run lint` must exit 0, then `npx jest tests/manifest.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
9. Commit: `git add src/manifest.json package.json LICENSE && git commit -m "feat: 1.1.0 manifest with optional host access, module worker and shortcut"`

**Context for Implementor**
- `"type": "module"` also applies to the legacy `src/background.js` until it is rewritten; it has no `import`/`export` and is strict-mode safe, so it keeps working.
- `activeTab` lets the popup read the active tab's URL for "Watch this page" without an install warning; `notifications` and host access are optional and requested at runtime by later tasks.
- Do not touch `src/background.js`, the popup, options or any `*.md` file.

**Acceptance Criteria**
- [ ] `npx jest tests/manifest.test.js` passes (5 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 12 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-5: Logger facade (src/lib/log.js)
**Type:** Feature
**Priority:** High
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/lib/log.test.js, src/lib/log.js

**Current State**
Every file calls `console.log`/`console.error` directly with ad-hoc messages (e.g. `'Updating badge...'`, `'Badge update alarm created successfully:'`), no scope, no levels, and some log the entire alarm object. There is no single place to enforce the "never log secrets" rule.

**Target State**
`src/lib/log.js` exports `createLogger(scope)` returning `{debug, info, warn, error}`; each forwards to the same-named `console` method with the message prefixed `[cdio:<scope>] ` and the remaining arguments unchanged (so `%s`/`%d` placeholders work). `debug` goes to `console.debug`, which Chrome DevTools shows only at the "Verbose" level — no setting needed. `src/lib/log.js` is the only file allowed to use `console` (ESLint `no-console`).

Public surface after this task (exact names and parameters):
- `src/lib/log.js`: `export function createLogger(scope)`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/lib/log.test.js` › createLogger › prefixes each level with [cdio:<scope>] and forwards arguments

**Implementation Steps**
1. Write the tests. Create `tests/lib/log.test.js` with exactly this content:

```js
import { createLogger } from '../../src/lib/log.js';

describe('createLogger', () => {
  test('prefixes each level with [cdio:<scope>] and forwards arguments', () => {
    const log = createLogger('unit');
    log.debug('a %s', 'x');
    log.info('b %d', 1);
    log.warn('c');
    log.error('d %s %d', 'y', 2);
    expect(console.debug).toHaveBeenCalledWith('[cdio:unit] a %s', 'x');
    expect(console.info).toHaveBeenCalledWith('[cdio:unit] b %d', 1);
    expect(console.warn).toHaveBeenCalledWith('[cdio:unit] c');
    expect(console.error).toHaveBeenCalledWith('[cdio:unit] d %s %d', 'y', 2);
  });
});
```
2. Run `npx jest tests/lib/log.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/lib/log.test.js && git commit -m "test: add tests for the scoped logger"`
4. Create `src/lib/log.js` with exactly this content:

```js
/**
 * @file Levelled console logger; every line starts with `[cdio:<scope>]`.
 *
 * Levels map to console methods: debug → console.debug (shown in Chrome DevTools only when
 * the "Verbose" level is enabled), info → console.info, warn → console.warn,
 * error → console.error. Use `%s` / `%d` placeholders, never template literals, and never
 * pass the API key or request headers.
 */

/**
 * Logger bound to one scope.
 *
 * @typedef {object} Logger
 * @property {function(string, ...*): void} debug - Sub-steps and internals.
 * @property {function(string, ...*): void} info - One line per meaningful action.
 * @property {function(string, ...*): void} warn - Degraded but continuing.
 * @property {function(string, ...*): void} error - The operation failed.
 */

/**
 * Create a logger whose lines start with `[cdio:<scope>]`.
 *
 * @param {string} scope - Component name, e.g. 'background' or 'popup'.
 * @returns {Logger} The scoped logger.
 */
export function createLogger(scope) {
  const tag = `[cdio:${scope}]`;
  return {
    debug: (message, ...args) => console.debug(`${tag} ${message}`, ...args),
    info: (message, ...args) => console.info(`${tag} ${message}`, ...args),
    warn: (message, ...args) => console.warn(`${tag} ${message}`, ...args),
    error: (message, ...args) => console.error(`${tag} ${message}`, ...args),
  };
}
```
5. Light checks: `npm run lint` must exit 0, then `npx jest tests/lib/log.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
6. Commit: `git add src/lib/log.js && git commit -m "feat: add scoped logger facade"`

**Context for Implementor**
Logging: only through `createLogger(scope)` from `src/lib/log.js` (ESLint `no-console` rejects `console.*` elsewhere). Lines start `[cdio:<scope>]`, use `%s`/`%d` placeholders, never include the API key.
- Every later module creates its logger once at module level: `const log = createLogger('<scope>');` with scopes `api`, `badge`, `scheduler`, `notify`, `refresh`, `actions`, `background`, `popup`, `options`.

**Acceptance Criteria**
- [ ] `npx jest tests/lib/log.test.js` passes (1 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 13 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-6: Relative time formatting (src/lib/format.js)
**Type:** Refactor
**Priority:** Medium
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/lib/format.test.js, src/lib/format.js

**Current State**
`PopupManager.formatDate()` in the legacy popup mixes Unix-number and ISO-string handling, reads the clock internally (not testable deterministically) and returns capitalised fragments ("Just now", "Never") that read awkwardly inside sentences.

**Target State**
`src/lib/format.js` exports `formatRelativeTime(epochSeconds, nowMs = Date.now())` returning: `'never'` for 0, negative, non-numeric or missing input; `'just now'` under 60 s (also for future times); `'Nm ago'` under 1 h; `'Nh ago'` under 24 h; `'Nd ago'` up to and including 7 days; otherwise `new Date(epochSeconds * 1000).toLocaleDateString()`. Input is Unix **seconds** (the API's unit).

Public surface after this task (exact names and parameters):
- `src/lib/format.js`: `export function formatRelativeTime(epochSeconds, nowMs = Date.now()`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/lib/format.test.js` › formatRelativeTime › uses the locale date beyond 7 days
- `tests/lib/format.test.js` › formatRelativeTime › defaults nowMs to Date.now()

**Implementation Steps**
1. Write the tests. Create `tests/lib/format.test.js` with exactly this content:

```js
import { formatRelativeTime } from '../../src/lib/format.js';

const NOW_MS = 1_700_000_000_000;
const NOW_S = NOW_MS / 1000;

describe('formatRelativeTime', () => {
  test.each([
    [0, 'never'],
    [-5, 'never'],
    [undefined, 'never'],
    ['123', 'never'],
    [Number.NaN, 'never'],
  ])('returns "never" for %p', (input, expected) => {
    expect(formatRelativeTime(input, NOW_MS)).toBe(expected);
  });

  test.each([
    [NOW_S, 'just now'],
    [NOW_S - 59, 'just now'],
    [NOW_S + 30, 'just now'],
    [NOW_S - 60, '1m ago'],
    [NOW_S - 59 * 60, '59m ago'],
    [NOW_S - 3600, '1h ago'],
    [NOW_S - 23 * 3600, '23h ago'],
    [NOW_S - 86400, '1d ago'],
    [NOW_S - 7 * 86400, '7d ago'],
  ])('formats %p as %p', (input, expected) => {
    expect(formatRelativeTime(input, NOW_MS)).toBe(expected);
  });

  test('uses the locale date beyond 7 days', () => {
    const eightDaysAgo = NOW_S - 8 * 86400;
    expect(formatRelativeTime(eightDaysAgo, NOW_MS)).toBe(new Date(eightDaysAgo * 1000).toLocaleDateString());
  });

  test('defaults nowMs to Date.now()', () => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW_MS);
    expect(formatRelativeTime(NOW_S - 120)).toBe('2m ago');
  });
});
```
2. Run `npx jest tests/lib/format.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/lib/format.test.js && git commit -m "test: add tests for relative time formatting"`
4. Create `src/lib/format.js` with exactly this content:

```js
/**
 * @file Human-friendly relative time formatting for the popup.
 */

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Format a Unix timestamp (seconds) relative to now.
 *
 * @param {number} epochSeconds - Unix time in seconds; 0, negative or non-numeric means "never".
 * @param {number} [nowMs] - Current time in milliseconds; defaults to Date.now().
 * @returns {string} 'never', 'just now', 'Nm ago', 'Nh ago', 'Nd ago' (up to 7 days) or a locale date.
 */
export function formatRelativeTime(epochSeconds, nowMs = Date.now()) {
  if (!Number.isFinite(epochSeconds) || epochSeconds <= 0) return 'never';
  const elapsed = Math.floor(nowMs / 1000) - epochSeconds;
  if (elapsed < MINUTE) return 'just now';
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m ago`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h ago`;
  if (elapsed <= 7 * DAY) return `${Math.floor(elapsed / DAY)}d ago`;
  return new Date(epochSeconds * 1000).toLocaleDateString();
}
```
5. Light checks: `npm run lint` must exit 0, then `npx jest tests/lib/format.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
6. Commit: `git add src/lib/format.js && git commit -m "feat: add relative time formatter"`

**Context for Implementor**
Used later by the popup: `Changed 2h ago`, `Updated just now`, `showing results from 5m ago`. Pure function — no chrome APIs, no logging.

**Acceptance Criteria**
- [ ] `npx jest tests/lib/format.test.js` passes (16 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 29 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-7: Watch list normalisation and the correct unread rule
**Type:** Bug Fix
**Priority:** Critical
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/lib/watches.test.js, src/lib/watches.js

**Current State**
Unread detection is duplicated in `countUnreadWatches()` (legacy `src/background.js`) and `PopupManager.isWatchUnread()` (legacy `src/popup/popup.js`), and both are wrong: they trust `viewed === false` first, but changedetection.io reports `viewed: false` for a brand-new watch that has only one snapshot (`last_changed: 0`). Every newly added watch therefore lights the red badge until its first change. The response-format normalisation is also duplicated (in `updateBadge()` and the `getWatches` message handler) and handles array shapes the API never returns.

**Target State**
New `src/lib/watches.js` (pure, no chrome APIs) with the `Watch` typedef and:
- `normalizeWatchList(response)` → `Object.entries(response).map(([uuid, watch]) => ({...watch, uuid}))`; throws `TypeError('Unexpected watch list format from server')` for `null`, arrays and non-objects.
- `isUnread(watch)` → `Number(watch.last_changed) > 0 && watch.viewed === false`.
- `countUnread(watches)` → number of unread watches.
The legacy files keep their own logic until the service worker and popup are rewritten in later tasks.

Public surface after this task (exact names and parameters):
- `src/lib/watches.js`: `export function normalizeWatchList(response)`
- `src/lib/watches.js`: `export function isUnread(watch)`
- `src/lib/watches.js`: `export function countUnread(watches)`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/lib/watches.test.js` › normalizeWatchList › turns a UUID-keyed object into an array with uuid added
- `tests/lib/watches.test.js` › normalizeWatchList › returns [] for an empty object
- `tests/lib/watches.test.js` › normalizeWatchList › throws TypeError for %p
- `tests/lib/watches.test.js` › isUnread / countUnread › changed and not viewed is unread
- `tests/lib/watches.test.js` › isUnread / countUnread › never changed is read even when viewed is false (new watch)
- `tests/lib/watches.test.js` › isUnread / countUnread › changed and viewed is read
- `tests/lib/watches.test.js` › isUnread / countUnread › countUnread counts only unread watches

**Implementation Steps**
1. Write the tests. Create `tests/lib/watches.test.js` with exactly this content:

```js
import { countUnread, isUnread, normalizeWatchList } from '../../src/lib/watches.js';

/**
 * Build a watch with sensible defaults.
 *
 * @param {object} overrides - Fields to override.
 * @returns {object} Watch.
 */
function watch(overrides = {}) {
  return { uuid: 'u1', url: 'https://example.com/page', title: null, page_title: null, last_changed: 0, viewed: true, ...overrides };
}

describe('normalizeWatchList', () => {
  test('turns a UUID-keyed object into an array with uuid added', () => {
    const result = normalizeWatchList({ a1: { url: 'https://a', viewed: true }, b2: { url: 'https://b', viewed: false } });
    expect(result).toEqual([
      { uuid: 'a1', url: 'https://a', viewed: true },
      { uuid: 'b2', url: 'https://b', viewed: false },
    ]);
  });

  test('returns [] for an empty object', () => {
    expect(normalizeWatchList({})).toEqual([]);
  });

  test.each([[null], [[]], ['text'], [42]])('throws TypeError for %p', (input) => {
    expect(() => normalizeWatchList(input)).toThrow(new TypeError('Unexpected watch list format from server'));
  });
});

describe('isUnread / countUnread', () => {
  test('changed and not viewed is unread', () => {
    expect(isUnread(watch({ last_changed: 100, viewed: false }))).toBe(true);
  });

  test('never changed is read even when viewed is false (new watch)', () => {
    expect(isUnread(watch({ last_changed: 0, viewed: false }))).toBe(false);
  });

  test('changed and viewed is read', () => {
    expect(isUnread(watch({ last_changed: 100, viewed: true }))).toBe(false);
  });

  test('countUnread counts only unread watches', () => {
    const watches = [
      watch({ uuid: 'a', last_changed: 100, viewed: false }),
      watch({ uuid: 'b', last_changed: 0, viewed: false }),
      watch({ uuid: 'c', last_changed: 100, viewed: true }),
      watch({ uuid: 'd', last_changed: 5, viewed: false }),
    ];
    expect(countUnread(watches)).toBe(2);
    expect(countUnread([])).toBe(0);
  });
});
```
2. Run `npx jest tests/lib/watches.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/lib/watches.test.js && git commit -m "test: add tests for watch list normalisation and unread rule"`
4. Create `src/lib/watches.js` with exactly this content:

```js
/**
 * @file Pure helpers for changedetection.io watch objects (no chrome.* or network access).
 *
 * `GET /api/v1/watch` returns an object keyed by watch UUID. Each value carries
 * `last_changed`, `last_checked`, `last_error`, `link`, `open_link`, `page_title`, `tags`,
 * `title`, `url` and `viewed`. Timestamps are Unix seconds; `last_changed` stays 0 until the
 * watch has at least two snapshots, and a brand-new watch reports `viewed: false`.
 */

/**
 * One watch from the list endpoint, plus its UUID.
 *
 * @typedef {object} Watch
 * @property {string} uuid - Watch UUID (the key in the API response).
 * @property {string} url - Monitored URL.
 * @property {string|null} [title] - User-defined title.
 * @property {string|null} [page_title] - Title scraped from the monitored page.
 * @property {string} [link] - Rendered URL; 'DISABLED' or '' when unusable.
 * @property {string} [open_link] - "Link to open" override, otherwise equal to link.
 * @property {number} last_changed - Unix seconds of the latest change, 0 when none.
 * @property {number} [last_checked] - Unix seconds of the latest check.
 * @property {string|false} [last_error] - Latest error message, or false.
 * @property {boolean} viewed - Server-side viewed flag.
 */

/**
 * Convert the list-endpoint response into an array of watches.
 *
 * @param {*} response - Parsed JSON body of `GET /api/v1/watch`.
 * @returns {Watch[]} One entry per UUID key, each with `uuid` added.
 * @throws {TypeError} When the response is not a plain object.
 */
export function normalizeWatchList(response) {
  if (response === null || typeof response !== 'object' || Array.isArray(response)) {
    throw new TypeError('Unexpected watch list format from server');
  }
  return Object.entries(response).map(([uuid, watch]) => ({ ...watch, uuid }));
}

/**
 * Whether a watch has a change the user has not viewed.
 *
 * @param {Watch} watch - The watch.
 * @returns {boolean} True when last_changed > 0 and viewed is false.
 */
export function isUnread(watch) {
  return Number(watch.last_changed) > 0 && watch.viewed === false;
}

/**
 * Count unread watches.
 *
 * @param {Watch[]} watches - The watches.
 * @returns {number} Number of watches for which isUnread() is true.
 */
export function countUnread(watches) {
  return watches.filter(isUnread).length;
}
```
5. Light checks: `npm run lint` must exit 0, then `npx jest tests/lib/watches.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
6. Commit: `git add src/lib/watches.js && git commit -m "fix: count a watch as unread only when it changed and is not viewed"`

**Context for Implementor**
Watch object = one value of `GET /api/v1/watch` (an object keyed by UUID) plus `uuid`: `url`, `title` (string|null), `page_title` (string|null), `link`, `open_link`, `last_changed` (Unix seconds; 0 until the watch has two snapshots), `last_checked`, `last_error` (string or false), `viewed` (boolean — a brand-new watch reports false). Unread ⇔ `last_changed > 0 && viewed === false`.
- Later tasks append more functions to this file; keep the file overview and typedef exactly as given.

**Acceptance Criteria**
- [ ] `npx jest tests/lib/watches.test.js` passes (10 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 39 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-8: Watch display helpers: title, links, sort order
**Type:** Feature
**Priority:** High
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/lib/watches.test.js, src/lib/watches.js

**Current State**
The legacy popup shows `watch.title || watch.url`, ignoring the `page_title` the server scrapes, so most rows show raw URLs. Clicking always opens `watch.url` (ignoring the server's rendered `link` and "Link to open" override `open_link`) and never the diff that shows what changed. Rows are sorted by `last_changed` only, so an old unread change sinks below newer read ones.

**Target State**
`src/lib/watches.js` gains (appended after `countUnread`):
- `displayTitle(watch)` → `title || page_title || url || 'Untitled watch'`.
- `siteUrl(watch)` → first of `open_link`, `link`, `url` starting with `http://` or `https://` (case-insensitive), else `null` (rejects `'DISABLED'`, `''`, `javascript:`).
- `primaryUrl(baseURL, watch)` → `` `${baseURL}/diff/${encodeURIComponent(uuid)}` `` when `last_changed > 0`, else `siteUrl(watch) ?? baseURL`.
- `sortWatches(watches)` → new array: unread first, then higher `last_changed` first, then `displayTitle` A→Z (`localeCompare`); the input is not mutated.

Public surface after this task (exact names and parameters):
- `src/lib/watches.js`: `export function displayTitle(watch)`
- `src/lib/watches.js`: `export function siteUrl(watch)`
- `src/lib/watches.js`: `export function primaryUrl(baseURL, watch)`
- `src/lib/watches.js`: `export function sortWatches(watches)`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/lib/watches.test.js` › displayTitle › prefers title, then page_title, then url, then a placeholder
- `tests/lib/watches.test.js` › siteUrl › prefers open_link, then link, then url
- `tests/lib/watches.test.js` › siteUrl › skips values that are not http(s)
- `tests/lib/watches.test.js` › primaryUrl › changed watch opens the server diff page
- `tests/lib/watches.test.js` › primaryUrl › never-changed watch opens the monitored page
- `tests/lib/watches.test.js` › primaryUrl › never-changed watch without an http(s) page opens the server
- `tests/lib/watches.test.js` › sortWatches › puts unread first, then newest change, then title A-Z, without mutating input

**Implementation Steps**
1. Write the tests. In `tests/lib/watches.test.js`, replace this exact text (it occurs exactly once):

```js
import { countUnread, isUnread, normalizeWatchList } from '../../src/lib/watches.js';

```

with:

```js
import {
  countUnread,
  displayTitle,
  isUnread,
  normalizeWatchList,
  primaryUrl,
  siteUrl,
  sortWatches,
} from '../../src/lib/watches.js';

const BASE = 'http://192.168.1.10:5000';

```
2. Append the following to the end of `tests/lib/watches.test.js` (keep everything already in the file):

```js
describe('displayTitle', () => {
  test('prefers title, then page_title, then url, then a placeholder', () => {
    expect(displayTitle(watch({ title: 'T', page_title: 'P' }))).toBe('T');
    expect(displayTitle(watch({ page_title: 'P' }))).toBe('P');
    expect(displayTitle(watch())).toBe('https://example.com/page');
    expect(displayTitle({ uuid: 'x' })).toBe('Untitled watch');
  });
});

describe('siteUrl', () => {
  test('prefers open_link, then link, then url', () => {
    expect(siteUrl(watch({ open_link: 'https://open', link: 'https://link' }))).toBe('https://open');
    expect(siteUrl(watch({ link: 'https://link' }))).toBe('https://link');
    expect(siteUrl(watch())).toBe('https://example.com/page');
  });

  test('skips values that are not http(s)', () => {
    expect(siteUrl(watch({ open_link: 'DISABLED', link: '', url: 'https://ok' }))).toBe('https://ok');
    expect(siteUrl(watch({ url: 'javascript:alert(1)' }))).toBeNull();
    expect(siteUrl({ uuid: 'x' })).toBeNull();
  });
});

describe('primaryUrl', () => {
  test('changed watch opens the server diff page', () => {
    expect(primaryUrl(BASE, watch({ uuid: 'ab/c', last_changed: 10 }))).toBe(`${BASE}/diff/ab%2Fc`);
  });

  test('never-changed watch opens the monitored page', () => {
    expect(primaryUrl(BASE, watch())).toBe('https://example.com/page');
  });

  test('never-changed watch without an http(s) page opens the server', () => {
    expect(primaryUrl(BASE, watch({ url: 'file:///x' }))).toBe(BASE);
  });
});

describe('sortWatches', () => {
  test('puts unread first, then newest change, then title A-Z, without mutating input', () => {
    const input = [
      watch({ uuid: 'read-old', title: 'B', last_changed: 10, viewed: true }),
      watch({ uuid: 'never-b', title: 'b2', last_changed: 0 }),
      watch({ uuid: 'unread-old', title: 'Z', last_changed: 5, viewed: false }),
      watch({ uuid: 'read-new', title: 'A', last_changed: 50, viewed: true }),
      watch({ uuid: 'unread-new', title: 'Y', last_changed: 40, viewed: false }),
      watch({ uuid: 'never-a', title: 'a1', last_changed: 0 }),
    ];
    const copy = [...input];
    expect(sortWatches(input).map((w) => w.uuid)).toEqual([
      'unread-new', 'unread-old', 'read-new', 'read-old', 'never-a', 'never-b',
    ]);
    expect(input).toEqual(copy);
  });
});
```
3. Run `npx jest tests/lib/watches.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
4. Commit only the test files: `git add tests/lib/watches.test.js && git commit -m "test: add tests for watch display helpers"`
5. Append the following to the end of `src/lib/watches.js` (keep everything already in the file):

```js
/**
 * Title to show for a watch.
 *
 * @param {Watch} watch - The watch.
 * @returns {string} title, else page_title, else url, else 'Untitled watch'.
 */
export function displayTitle(watch) {
  return watch.title || watch.page_title || watch.url || 'Untitled watch';
}

/**
 * URL of the monitored page.
 *
 * @param {Watch} watch - The watch.
 * @returns {string|null} First of open_link, link, url that starts with http:// or https://, else null.
 */
export function siteUrl(watch) {
  const candidates = [watch.open_link, watch.link, watch.url];
  return candidates.find((value) => typeof value === 'string' && /^https?:\/\//i.test(value)) ?? null;
}

/**
 * URL opened when the user clicks a watch row.
 *
 * @param {string} baseURL - Normalized server URL without trailing slash.
 * @param {Watch} watch - The watch.
 * @returns {string} The server diff page when the watch has changed; otherwise siteUrl(watch), or baseURL when that is null.
 */
export function primaryUrl(baseURL, watch) {
  if (Number(watch.last_changed) > 0) return `${baseURL}/diff/${encodeURIComponent(watch.uuid)}`;
  return siteUrl(watch) ?? baseURL;
}

/**
 * Sort watches for display.
 *
 * @param {Watch[]} watches - The watches (not modified).
 * @returns {Watch[]} New array: unread first, then newest last_changed first, then displayTitle A to Z.
 */
export function sortWatches(watches) {
  return [...watches].sort(
    (a, b) =>
      Number(isUnread(b)) - Number(isUnread(a)) ||
      (Number(b.last_changed) || 0) - (Number(a.last_changed) || 0) ||
      displayTitle(a).localeCompare(displayTitle(b)),
  );
}
```
6. Light checks: `npm run lint` must exit 0, then `npx jest tests/lib/watches.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
7. Commit: `git add src/lib/watches.js && git commit -m "feat: add watch title, link and sort helpers"`

**Context for Implementor**
Watch object = one value of `GET /api/v1/watch` (an object keyed by UUID) plus `uuid`: `url`, `title` (string|null), `page_title` (string|null), `link`, `open_link`, `last_changed` (Unix seconds; 0 until the watch has two snapshots), `last_checked`, `last_error` (string or false), `viewed` (boolean — a brand-new watch reports false). Unread ⇔ `last_changed > 0 && viewed === false`.
- `/diff/<uuid>` is the changedetection.io web UI diff page; opening it also marks the watch viewed on the server (text/restock processors). A watch with fewer than two snapshots has no diff (the server redirects), hence the site URL fallback.

**Acceptance Criteria**
- [ ] `npx jest tests/lib/watches.test.js` passes (17 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 46 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-9: Watch filter and find-by-URL helpers
**Type:** Feature
**Priority:** Medium
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/lib/watches.test.js, src/lib/watches.js

**Current State**
There is no way to filter a long watch list, and nothing can tell whether the page in the active tab is already watched (needed by "Watch this page").

**Target State**
`src/lib/watches.js` gains (appended at the end):
- `filterWatches(watches, query)` → the same array object when `query.trim()` is empty; otherwise watches whose `displayTitle` or `url` contains the trimmed query, case-insensitively.
- `findWatchByUrl(watches, url)` → first watch whose URL equals `url` after removing the fragment and one trailing slash; unparsable values are compared as plain strings; `undefined` when none.
- private `comparableUrl(value)` (not exported) implements that normalisation.

Public surface after this task (exact names and parameters):
- `src/lib/watches.js`: `export function filterWatches(watches, query)`
- `src/lib/watches.js`: `export function findWatchByUrl(watches, url)`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/lib/watches.test.js` › filterWatches › blank query returns the same array
- `tests/lib/watches.test.js` › filterWatches › matches title or url, case-insensitive, trimmed
- `tests/lib/watches.test.js` › findWatchByUrl › ignores fragment and one trailing slash
- `tests/lib/watches.test.js` › findWatchByUrl › compares unparsable values as plain strings
- `tests/lib/watches.test.js` › findWatchByUrl › returns undefined when nothing matches

**Implementation Steps**
1. Write the tests. In `tests/lib/watches.test.js`, replace this exact text (it occurs exactly once):

```js
import {
  countUnread,
  displayTitle,
  isUnread,
  normalizeWatchList,
  primaryUrl,
  siteUrl,
  sortWatches,
} from '../../src/lib/watches.js';
```

with:

```js
import {
  countUnread,
  displayTitle,
  filterWatches,
  findWatchByUrl,
  isUnread,
  normalizeWatchList,
  primaryUrl,
  siteUrl,
  sortWatches,
} from '../../src/lib/watches.js';
```
2. Append the following to the end of `tests/lib/watches.test.js` (keep everything already in the file):

```js
describe('filterWatches', () => {
  const watches = [
    watch({ uuid: '1', title: 'Grafana Release', url: 'https://github.com/grafana' }),
    watch({ uuid: '2', title: 'Prices', url: 'https://shop.example/item' }),
  ];

  test('blank query returns the same array', () => {
    expect(filterWatches(watches, '   ')).toBe(watches);
  });

  test('matches title or url, case-insensitive, trimmed', () => {
    expect(filterWatches(watches, ' grafana ').map((w) => w.uuid)).toEqual(['1']);
    expect(filterWatches(watches, 'SHOP.EXAMPLE').map((w) => w.uuid)).toEqual(['2']);
    expect(filterWatches(watches, 'nothing')).toEqual([]);
  });
});

describe('findWatchByUrl', () => {
  const watches = [watch({ uuid: '1', url: 'https://example.com/page' }), watch({ uuid: '2', url: 'not a url' })];

  test('ignores fragment and one trailing slash', () => {
    expect(findWatchByUrl(watches, 'https://example.com/page/#top').uuid).toBe('1');
    expect(findWatchByUrl(watches, 'https://example.com/page').uuid).toBe('1');
  });

  test('compares unparsable values as plain strings', () => {
    expect(findWatchByUrl(watches, 'not a url').uuid).toBe('2');
  });

  test('returns undefined when nothing matches', () => {
    expect(findWatchByUrl(watches, 'https://example.com/other')).toBeUndefined();
  });
});
```
3. Run `npx jest tests/lib/watches.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
4. Commit only the test files: `git add tests/lib/watches.test.js && git commit -m "test: add tests for watch filter and URL lookup"`
5. Append the following to the end of `src/lib/watches.js` (keep everything already in the file):

```js
/**
 * Keep the watches matching a free-text query.
 *
 * @param {Watch[]} watches - The watches.
 * @param {string} query - Text typed by the user.
 * @returns {Watch[]} Watches whose displayTitle or url contains the trimmed query (case-insensitive); the input array when the query is blank.
 */
export function filterWatches(watches, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return watches;
  return watches.filter(
    (watch) =>
      displayTitle(watch).toLowerCase().includes(needle) ||
      String(watch.url ?? '').toLowerCase().includes(needle),
  );
}

/**
 * Find the watch that monitors a page.
 *
 * @param {Watch[]} watches - The watches.
 * @param {string} url - Page URL.
 * @returns {Watch|undefined} The first watch whose url equals the page URL, ignoring the fragment and one trailing slash.
 */
export function findWatchByUrl(watches, url) {
  const target = comparableUrl(url);
  return watches.find((watch) => comparableUrl(watch.url) === target);
}

/**
 * Normalize a URL for equality checks.
 *
 * @param {*} value - URL string.
 * @returns {string} The parsed href without fragment and trailing slash, or String(value) when unparsable.
 */
function comparableUrl(value) {
  try {
    const url = new URL(String(value));
    url.hash = '';
    return url.href.replace(/\/$/, '');
  } catch {
    return String(value);
  }
}
```
6. Light checks: `npm run lint` must exit 0, then `npx jest tests/lib/watches.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
7. Commit: `git add src/lib/watches.js && git commit -m "feat: add watch filter and find-by-URL helpers"`

**Context for Implementor**
Watch object = one value of `GET /api/v1/watch` (an object keyed by UUID) plus `uuid`: `url`, `title` (string|null), `page_title` (string|null), `link`, `open_link`, `last_changed` (Unix seconds; 0 until the watch has two snapshots), `last_checked`, `last_error` (string or false), `viewed` (boolean — a brand-new watch reports false). Unread ⇔ `last_changed > 0 && viewed === false`.
- Private functions need JSDoc too (the lint gate requires it).

**Acceptance Criteria**
- [ ] `npx jest tests/lib/watches.test.js` passes (22 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 51 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-10: Settings validation and URL normalisation
**Type:** Bug Fix
**Priority:** High
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/lib/settings.test.js, src/lib/settings.js

**Current State**
The legacy options page accepts any string `new URL()` parses — `javascript:alert(1)` passes — and stores it verbatim, with trailing slashes or a pasted `/api/v1/watch/` (the most common setup mistake listed in INSTALLATION.md). `parseInt(value) || 5` turns `0` into 5 silently. Validation is duplicated between Save and Test.

**Target State**
New `src/lib/settings.js` (pure part) exporting `DEFAULT_REFRESH_MINUTES = 5`, `MIN_REFRESH_MINUTES = 1`, `MAX_REFRESH_MINUTES = 1440`, `SETTINGS_KEYS = ['baseURL', 'apiKey', 'refreshInterval', 'notificationsEnabled']` and:
- `normalizeBaseUrl(input)` → `origin + path` with trailing slashes and a trailing `/api…` segment removed, credentials/query/fragment dropped; `null` unless the protocol is `http:`/`https:`.
- `isValidRefreshInterval(value)` → integer in 1…1440.
- `validateConnection({baseURL, apiKey})` → `{ok: true, value: {baseURL, apiKey}}` (normalized, trimmed) or `{ok: false, error}` with exactly `'Enter your server URL.'`, `'Enter a valid http:// or https:// URL, e.g. http://192.168.1.10:5000'`, `'Enter your API key.'`.
- `validateSettings({baseURL, apiKey, refreshInterval})` → as above plus `'Refresh interval must be a whole number from 1 to 1440 minutes.'`.
- `hostPermissionPattern(baseURL)` → `` `${protocol}//${hostname}/*` `` (no port: Chrome match patterns without a port match every port).

Public surface after this task (exact names and parameters):
- `src/lib/settings.js`: `export const DEFAULT_REFRESH_MINUTES = 5`
- `src/lib/settings.js`: `export const MIN_REFRESH_MINUTES = 1`
- `src/lib/settings.js`: `export const MAX_REFRESH_MINUTES = 1440`
- `src/lib/settings.js`: `export const SETTINGS_KEYS = ['baseURL', 'apiKey', 'refreshInterval', 'notificationsEnabled']`
- `src/lib/settings.js`: `export function normalizeBaseUrl(input)`
- `src/lib/settings.js`: `export function isValidRefreshInterval(value)`
- `src/lib/settings.js`: `export function validateConnection({ baseURL, apiKey })`
- `src/lib/settings.js`: `export function validateSettings({ baseURL, apiKey, refreshInterval })`
- `src/lib/settings.js`: `export function hostPermissionPattern(baseURL)`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/lib/settings.test.js` › validateConnection › requires a server URL
- `tests/lib/settings.test.js` › validateConnection › rejects non-http(s) URLs
- `tests/lib/settings.test.js` › validateConnection › requires an API key
- `tests/lib/settings.test.js` › validateConnection › returns normalized, trimmed values
- `tests/lib/settings.test.js` › validateSettings › passes connection errors through
- `tests/lib/settings.test.js` › validateSettings › rejects an out-of-range interval
- `tests/lib/settings.test.js` › validateSettings › returns all normalized values
- `tests/lib/settings.test.js` › hostPermissionPattern › drops port and path

**Implementation Steps**
1. Write the tests. Create `tests/lib/settings.test.js` with exactly this content:

```js
import {
  hostPermissionPattern,
  isValidRefreshInterval,
  normalizeBaseUrl,
  validateConnection,
  validateSettings,
} from '../../src/lib/settings.js';

describe('normalizeBaseUrl', () => {
  test.each([
    ['http://192.168.1.10:5000', 'http://192.168.1.10:5000'],
    ['  http://192.168.1.10:5000/  ', 'http://192.168.1.10:5000'],
    ['https://cd.example.com//', 'https://cd.example.com'],
    ['http://host:5000/api/v1/watch/', 'http://host:5000'],
    ['http://host/changedetection/api', 'http://host/changedetection'],
    ['http://host/apiary', 'http://host/apiary'],
    ['http://user:pass@host:5000/?q=1#x', 'http://host:5000'],
  ])('normalizes %p to %p', (input, expected) => {
    expect(normalizeBaseUrl(input)).toBe(expected);
  });

  test.each([[''], ['not a url'], ['javascript:alert(1)'], ['ftp://host'], [undefined], [null]])(
    'returns null for %p',
    (input) => {
      expect(normalizeBaseUrl(input)).toBeNull();
    },
  );
});

describe('isValidRefreshInterval', () => {
  test.each([
    [1, true],
    [1440, true],
    [5, true],
    [0, false],
    [1441, false],
    [2.5, false],
    [Number.NaN, false],
    ['5', false],
  ])('%p -> %p', (value, expected) => {
    expect(isValidRefreshInterval(value)).toBe(expected);
  });
});

describe('validateConnection', () => {
  test('requires a server URL', () => {
    expect(validateConnection({ baseURL: ' ', apiKey: 'k' })).toEqual({ ok: false, error: 'Enter your server URL.' });
  });

  test('rejects non-http(s) URLs', () => {
    expect(validateConnection({ baseURL: 'javascript:alert(1)', apiKey: 'k' })).toEqual({
      ok: false,
      error: 'Enter a valid http:// or https:// URL, e.g. http://192.168.1.10:5000',
    });
  });

  test('requires an API key', () => {
    expect(validateConnection({ baseURL: 'http://h', apiKey: '  ' })).toEqual({ ok: false, error: 'Enter your API key.' });
  });

  test('returns normalized, trimmed values', () => {
    expect(validateConnection({ baseURL: 'http://h:5000/', apiKey: ' key ' })).toEqual({
      ok: true,
      value: { baseURL: 'http://h:5000', apiKey: 'key' },
    });
  });
});

describe('validateSettings', () => {
  test('passes connection errors through', () => {
    expect(validateSettings({ baseURL: '', apiKey: 'k', refreshInterval: 5 }).ok).toBe(false);
  });

  test('rejects an out-of-range interval', () => {
    expect(validateSettings({ baseURL: 'http://h', apiKey: 'k', refreshInterval: 0 })).toEqual({
      ok: false,
      error: 'Refresh interval must be a whole number from 1 to 1440 minutes.',
    });
  });

  test('returns all normalized values', () => {
    expect(validateSettings({ baseURL: 'http://h/', apiKey: 'k', refreshInterval: 15 })).toEqual({
      ok: true,
      value: { baseURL: 'http://h', apiKey: 'k', refreshInterval: 15 },
    });
  });
});

describe('hostPermissionPattern', () => {
  test('drops port and path', () => {
    expect(hostPermissionPattern('http://192.168.1.10:5000/cd')).toBe('http://192.168.1.10/*');
    expect(hostPermissionPattern('https://cd.example.com')).toBe('https://cd.example.com/*');
  });
});
```
2. Run `npx jest tests/lib/settings.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/lib/settings.test.js && git commit -m "test: add tests for settings validation and URL normalisation"`
4. Create `src/lib/settings.js` with exactly this content:

```js
/**
 * @file Extension settings: defaults, validation, loading, and host-permission helpers.
 *
 * Settings live in chrome.storage.sync under SETTINGS_KEYS. The server origin must also be
 * granted as an optional host permission, otherwise Chrome blocks requests to servers on the
 * local network.
 */

export const DEFAULT_REFRESH_MINUTES = 5;
export const MIN_REFRESH_MINUTES = 1;
export const MAX_REFRESH_MINUTES = 1440;
export const SETTINGS_KEYS = ['baseURL', 'apiKey', 'refreshInterval', 'notificationsEnabled'];

/**
 * Normalize a user-entered server URL.
 *
 * @param {*} input - Raw text from the Server URL field or storage.
 * @returns {string|null} Origin plus path, without trailing slashes and without a pasted `/api…` suffix; null when not an http(s) URL.
 */
export function normalizeBaseUrl(input) {
  let url;
  try {
    url = new URL(String(input ?? '').trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  const path = url.pathname.replace(/\/api(\/.*)?$/i, '').replace(/\/+$/, '');
  return `${url.origin}${path}`;
}

/**
 * Whether a refresh interval is allowed.
 *
 * @param {*} value - Candidate number of minutes.
 * @returns {boolean} True for an integer from MIN_REFRESH_MINUTES to MAX_REFRESH_MINUTES.
 */
export function isValidRefreshInterval(value) {
  return Number.isInteger(value) && value >= MIN_REFRESH_MINUTES && value <= MAX_REFRESH_MINUTES;
}

/**
 * Validate the server URL and API key typed by the user.
 *
 * @param {{baseURL: string, apiKey: string}} input - Raw form values.
 * @returns {{ok: true, value: {baseURL: string, apiKey: string}}|{ok: false, error: string}} Normalized values or a user-facing error.
 */
export function validateConnection({ baseURL, apiKey }) {
  if (!String(baseURL ?? '').trim()) return { ok: false, error: 'Enter your server URL.' };
  const normalized = normalizeBaseUrl(baseURL);
  if (!normalized) {
    return { ok: false, error: 'Enter a valid http:// or https:// URL, e.g. http://192.168.1.10:5000' };
  }
  const key = String(apiKey ?? '').trim();
  if (!key) return { ok: false, error: 'Enter your API key.' };
  return { ok: true, value: { baseURL: normalized, apiKey: key } };
}

/**
 * Validate all fields saved by the options page.
 *
 * @param {{baseURL: string, apiKey: string, refreshInterval: number}} input - Raw form values; refreshInterval already converted with Number().
 * @returns {{ok: true, value: {baseURL: string, apiKey: string, refreshInterval: number}}|{ok: false, error: string}} Normalized values or a user-facing error.
 */
export function validateSettings({ baseURL, apiKey, refreshInterval }) {
  const connection = validateConnection({ baseURL, apiKey });
  if (!connection.ok) return connection;
  if (!isValidRefreshInterval(refreshInterval)) {
    return {
      ok: false,
      error: `Refresh interval must be a whole number from ${MIN_REFRESH_MINUTES} to ${MAX_REFRESH_MINUTES} minutes.`,
    };
  }
  return { ok: true, value: { ...connection.value, refreshInterval } };
}

/**
 * Host-permission match pattern covering a server URL on any port.
 *
 * @param {string} baseURL - Normalized server URL.
 * @returns {string} Pattern such as 'http://192.168.1.10/*'.
 */
export function hostPermissionPattern(baseURL) {
  const url = new URL(baseURL);
  return `${url.protocol}//${url.hostname}/*`;
}
```
5. Light checks: `npm run lint` must exit 0, then `npx jest tests/lib/settings.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
6. Commit: `git add src/lib/settings.js && git commit -m "fix: validate and normalise server URL and refresh interval"`

**Context for Implementor**
Storage keys: `chrome.storage.sync` — `baseURL` (normalized, no trailing slash), `apiKey`, `refreshInterval` (integer minutes 1–1440, default 5), `notificationsEnabled` (boolean, default false); `chrome.storage.session` — `watchCache` `{watches, fetchedAt}` and `refreshFailureCount` (number); `chrome.storage.local` — `notifiedUuids` (string[]).
- The error strings are shown verbatim on the options page by a later task — keep them exact.
- The next task appends loading and permission helpers to this same file.

**Acceptance Criteria**
- [ ] `npx jest tests/lib/settings.test.js` passes (29 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 80 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-11: Settings loading and host-permission helpers
**Type:** Refactor
**Priority:** High
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/lib/settings.test.js, src/lib/settings.js

**Current State**
Settings are read in four places with callback-style `chrome.storage.sync.get` and ad-hoc defaults (`|| 5`, `|| ''`); the service worker caches them in memory behind an `isInitialized` flag that must be reset by hand. Values saved by 1.0.1 may carry a trailing slash. Nothing checks or requests host access to the server.

**Target State**
`src/lib/settings.js` gains (appended after `hostPermissionPattern`) the `Settings` typedef and:
- `loadSettings()` → `{baseURL: normalizeBaseUrl(stored) ?? '', apiKey: trimmed string or '', refreshInterval: valid value or 5, notificationsEnabled: stored === true}` read with `chrome.storage.sync.get(SETTINGS_KEYS)` (promise style) — legacy values are normalised on read.
- `isConfigured(settings)` → both `baseURL` and `apiKey` non-empty.
- `hasHostPermission(baseURL)` → `chrome.permissions.contains({origins: [hostPermissionPattern(baseURL)]})`.
- `requestHostPermission(baseURL)` → `chrome.permissions.request({origins: [hostPermissionPattern(baseURL)]})`, returned without `await` so callers can invoke it synchronously inside a click handler.

Public surface after this task (exact names and parameters):
- `src/lib/settings.js`: `export async function loadSettings()`
- `src/lib/settings.js`: `export function isConfigured(settings)`
- `src/lib/settings.js`: `export function hasHostPermission(baseURL)`
- `src/lib/settings.js`: `export function requestHostPermission(baseURL)`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/lib/settings.test.js` › loadSettings / isConfigured › applies defaults when nothing is stored
- `tests/lib/settings.test.js` › loadSettings / isConfigured › normalizes a legacy stored URL and keeps valid values
- `tests/lib/settings.test.js` › loadSettings / isConfigured › falls back for invalid stored values
- `tests/lib/settings.test.js` › loadSettings / isConfigured › isConfigured needs both URL and key
- `tests/lib/settings.test.js` › host permission helpers › hasHostPermission asks chrome.permissions.contains for the origin pattern
- `tests/lib/settings.test.js` › host permission helpers › requestHostPermission calls chrome.permissions.request synchronously

**Implementation Steps**
1. Write the tests. In `tests/lib/settings.test.js`, replace this exact text (it occurs exactly once):

```js
import {
  hostPermissionPattern,
  isValidRefreshInterval,
  normalizeBaseUrl,
  validateConnection,
  validateSettings,
} from '../../src/lib/settings.js';
```

with:

```js
import {
  DEFAULT_REFRESH_MINUTES,
  SETTINGS_KEYS,
  hasHostPermission,
  hostPermissionPattern,
  isConfigured,
  isValidRefreshInterval,
  loadSettings,
  normalizeBaseUrl,
  requestHostPermission,
  validateConnection,
  validateSettings,
} from '../../src/lib/settings.js';
```
2. Append the following to the end of `tests/lib/settings.test.js` (keep everything already in the file):

```js
describe('loadSettings / isConfigured', () => {
  test('applies defaults when nothing is stored', async () => {
    expect(await loadSettings()).toEqual({
      baseURL: '',
      apiKey: '',
      refreshInterval: DEFAULT_REFRESH_MINUTES,
      notificationsEnabled: false,
    });
    expect(chrome.storage.sync.get).toHaveBeenCalledWith(SETTINGS_KEYS);
  });

  test('normalizes a legacy stored URL and keeps valid values', async () => {
    await chrome.storage.sync.set({
      baseURL: 'http://192.168.1.10:5000/',
      apiKey: 'key',
      refreshInterval: 10,
      notificationsEnabled: true,
    });
    const settings = await loadSettings();
    expect(settings).toEqual({
      baseURL: 'http://192.168.1.10:5000',
      apiKey: 'key',
      refreshInterval: 10,
      notificationsEnabled: true,
    });
    expect(isConfigured(settings)).toBe(true);
  });

  test('falls back for invalid stored values', async () => {
    await chrome.storage.sync.set({ baseURL: 'javascript:x', apiKey: 42, refreshInterval: 0, notificationsEnabled: 'yes' });
    const settings = await loadSettings();
    expect(settings).toEqual({ baseURL: '', apiKey: '', refreshInterval: 5, notificationsEnabled: false });
    expect(isConfigured(settings)).toBe(false);
  });

  test('isConfigured needs both URL and key', () => {
    expect(isConfigured({ baseURL: 'http://h', apiKey: '' })).toBe(false);
    expect(isConfigured({ baseURL: '', apiKey: 'k' })).toBe(false);
  });
});

describe('host permission helpers', () => {
  test('hasHostPermission asks chrome.permissions.contains for the origin pattern', async () => {
    chrome.permissions.contains.mockResolvedValueOnce(false);
    expect(await hasHostPermission('http://192.168.1.10:5000')).toBe(false);
    expect(chrome.permissions.contains).toHaveBeenCalledWith({ origins: ['http://192.168.1.10/*'] });
  });

  test('requestHostPermission calls chrome.permissions.request synchronously', async () => {
    const pending = requestHostPermission('http://192.168.1.10:5000');
    expect(chrome.permissions.request).toHaveBeenCalledWith({ origins: ['http://192.168.1.10/*'] });
    expect(await pending).toBe(true);
  });
});
```
3. Run `npx jest tests/lib/settings.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
4. Commit only the test files: `git add tests/lib/settings.test.js && git commit -m "test: add tests for settings loading and permission helpers"`
5. Append the following to the end of `src/lib/settings.js` (keep everything already in the file):

```js
/**
 * Saved extension settings with defaults applied.
 *
 * @typedef {object} Settings
 * @property {string} baseURL - Normalized server URL, '' when unset.
 * @property {string} apiKey - API key, '' when unset.
 * @property {number} refreshInterval - Minutes between background refreshes.
 * @property {boolean} notificationsEnabled - Whether desktop notifications are on.
 */

/**
 * Load saved settings and apply defaults.
 *
 * @returns {Promise<Settings>} The settings; an invalid saved URL loads as ''.
 */
export async function loadSettings() {
  const stored = await chrome.storage.sync.get(SETTINGS_KEYS);
  return {
    baseURL: normalizeBaseUrl(stored.baseURL) ?? '',
    apiKey: typeof stored.apiKey === 'string' ? stored.apiKey.trim() : '',
    refreshInterval: isValidRefreshInterval(stored.refreshInterval) ? stored.refreshInterval : DEFAULT_REFRESH_MINUTES,
    notificationsEnabled: stored.notificationsEnabled === true,
  };
}

/**
 * Whether the extension can talk to a server.
 *
 * @param {Settings} settings - Loaded settings.
 * @returns {boolean} True when both baseURL and apiKey are non-empty.
 */
export function isConfigured(settings) {
  return Boolean(settings.baseURL && settings.apiKey);
}

/**
 * Whether Chrome already granted access to the server origin.
 *
 * @param {string} baseURL - Normalized server URL.
 * @returns {Promise<boolean>} Result of chrome.permissions.contains.
 */
export function hasHostPermission(baseURL) {
  return chrome.permissions.contains({ origins: [hostPermissionPattern(baseURL)] });
}

/**
 * Ask Chrome for access to the server origin.
 *
 * Call it synchronously from a click or submit handler, before any `await`, or Chrome
 * rejects the request for lacking a user gesture.
 *
 * @param {string} baseURL - Normalized server URL.
 * @returns {Promise<boolean>} True when access is granted.
 */
export function requestHostPermission(baseURL) {
  return chrome.permissions.request({ origins: [hostPermissionPattern(baseURL)] });
}
```
6. Light checks: `npm run lint` must exit 0, then `npx jest tests/lib/settings.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
7. Commit: `git add src/lib/settings.js && git commit -m "feat: add settings loader and host-permission helpers"`

**Context for Implementor**
Storage keys: `chrome.storage.sync` — `baseURL` (normalized, no trailing slash), `apiKey`, `refreshInterval` (integer minutes 1–1440, default 5), `notificationsEnabled` (boolean, default false); `chrome.storage.session` — `watchCache` `{watches, fetchedAt}` and `refreshFailureCount` (number); `chrome.storage.local` — `notifiedUuids` (string[]).
- Settings are read fresh on every use (cheap); no in-memory cache.
- `chrome.permissions.request` only works from a user gesture: callers must call `requestHostPermission` before any `await` in their click/submit handler.
- Test environment: `globalThis.chrome` is the in-memory fake from `tests/helpers/chrome-fake.js`, reset before every test (storage emptied, mocks fresh, event listeners kept); `fetch` is a fresh `jest.fn()` per test; `console.*` is silenced and recorded — `hasLog(level, pattern)` / `allLogText()` from `tests/helpers/logs.js` assert on it.

**Acceptance Criteria**
- [ ] `npx jest tests/lib/settings.test.js` passes (35 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 86 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-12: API client core: timeouts, error mapping, safe logging
**Type:** Bug Fix
**Priority:** High
**Effort:** Medium (1–2 h)
**Tier:** Haiku
**Files:** tests/lib/api.test.js, src/lib/api.js

**Current State**
`ChangeDetectionAPI.makeRequest()` (legacy `src/background.js`) has no timeout — a hung server leaves the popup spinner forever; it sends `Content-Type: application/json` even on bodiless GETs; it appends the raw response body to the error message, so a reverse-proxy HTML page ends up in the popup; network errors surface as the bare `Failed to fetch`.

**Target State**
New `src/lib/api.js` with `REQUEST_TIMEOUT_MS = 15000`, `class ApiError extends Error` (`name` `'ApiError'`, `kind`, `status` default 0), private `httpError(status)`, and `class ChangeDetectionClient` with:
- `constructor({baseURL, apiKey, fetchImpl = (input, init) => globalThis.fetch(input, init), timeoutMs = REQUEST_TIMEOUT_MS})`.
- `request(path, {method = 'GET', body} = {})`: sends header `x-api-key` (plus `Content-Type: application/json` and a JSON body only when `body` is given) with `signal: AbortSignal.timeout(timeoutMs)`; maps failures to `ApiError`: 401/403 → `auth` `API key rejected (HTTP 403)`; 404 → `not_found` `API not found (HTTP 404). Check the server URL.`; other non-2xx → `http` `Server error (HTTP 500)`; `TimeoutError`/`AbortError` → `timeout` `Server did not respond within 15 s`; other fetch errors → `network` `Cannot reach <baseURL>`; unparsable JSON → `invalid_response` `Server sent an invalid response (not JSON)`. Response bodies are never included in messages.
- Every request logs one DEBUG line (method, path, status or error name, elapsed ms) — never the key or headers.

Public surface after this task (exact names and parameters):
- `src/lib/api.js`: `export const REQUEST_TIMEOUT_MS = 15000`
- `src/lib/api.js`: `export class ApiError`
- `src/lib/api.js`: method `constructor(message, { kind, status = 0 })`
- `src/lib/api.js`: `export class ChangeDetectionClient`
- `src/lib/api.js`: method `constructor({ baseURL, apiKey, fetchImpl = (input, init) => globalThis.fetch(input, init), timeoutMs = REQUEST_TIMEOUT_MS })`
- `src/lib/api.js`: method `async request(path, { method = 'GET', body } = {})`

Log lines this task adds (level and exact format string, arguments as in the code below):
- DEBUG `%s %s failed after %d ms: %s`
- DEBUG `%s %s -> HTTP %d in %d ms`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/lib/api.test.js` › ApiError › carries kind and status
- `tests/lib/api.test.js` › ChangeDetectionClient.request › GET sends only the API key header and a timeout signal
- `tests/lib/api.test.js` › ChangeDetectionClient.request › a body adds JSON content type
- `tests/lib/api.test.js` › ChangeDetectionClient.request › network failure becomes kind network
- `tests/lib/api.test.js` › ChangeDetectionClient.request › %s becomes kind timeout
- `tests/lib/api.test.js` › ChangeDetectionClient.request › non-JSON body becomes kind invalid_response
- `tests/lib/api.test.js` › ChangeDetectionClient.request › logs each request at debug level and never logs the API key
- `tests/lib/api.test.js` › ChangeDetectionClient.request › defaults to the global fetch

**Implementation Steps**
1. Write the tests. Create `tests/lib/api.test.js` with exactly this content:

```js
import { ApiError, ChangeDetectionClient, REQUEST_TIMEOUT_MS } from '../../src/lib/api.js';
import { allLogText, hasLog } from '../helpers/logs.js';

const BASE = 'http://192.168.1.10:5000';
const KEY = 'secret-key-123';

/**
 * Fake fetch Response.
 *
 * @param {*} body - JSON body.
 * @param {number} status - HTTP status.
 * @returns {object} Response-like object.
 */
function jsonResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

/**
 * Client with a mocked fetch.
 *
 * @param {Function} fetchImpl - Fetch mock.
 * @returns {ChangeDetectionClient} Client.
 */
function client(fetchImpl) {
  return new ChangeDetectionClient({ baseURL: BASE, apiKey: KEY, fetchImpl });
}

describe('ApiError', () => {
  test('carries kind and status', () => {
    const error = new ApiError('msg', { kind: 'auth', status: 403 });
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiError');
    expect(error.message).toBe('msg');
    expect(error.kind).toBe('auth');
    expect(error.status).toBe(403);
    expect(new ApiError('m', { kind: 'network' }).status).toBe(0);
  });
});

describe('ChangeDetectionClient.request', () => {
  test('GET sends only the API key header and a timeout signal', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse({ ok: 1 }));
    expect(await client(fetchImpl).request('/api/v1/watch')).toEqual({ ok: 1 });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(`${BASE}/api/v1/watch`);
    expect(init.method).toBe('GET');
    expect(init.headers).toEqual({ 'x-api-key': KEY });
    expect(init.body).toBeUndefined();
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  test('a body adds JSON content type', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse('OK'));
    await client(fetchImpl).request('/api/v1/watch/x', { method: 'PUT', body: { last_viewed: 1 } });
    const [, init] = fetchImpl.mock.calls[0];
    expect(init.headers).toEqual({ 'x-api-key': KEY, 'Content-Type': 'application/json' });
    expect(init.body).toBe('{"last_viewed":1}');
  });

  test.each([
    [401, 'auth', 'API key rejected (HTTP 401)'],
    [403, 'auth', 'API key rejected (HTTP 403)'],
    [404, 'not_found', 'API not found (HTTP 404). Check the server URL.'],
    [500, 'http', 'Server error (HTTP 500)'],
  ])('HTTP %d becomes ApiError kind %s', async (status, kind, message) => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse('<html>proxy page</html>', status));
    await expect(client(fetchImpl).request('/api/v1/watch')).rejects.toMatchObject({ name: 'ApiError', kind, status, message });
  });

  test('network failure becomes kind network', async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(client(fetchImpl).request('/api/v1/watch')).rejects.toMatchObject({
      kind: 'network',
      status: 0,
      message: `Cannot reach ${BASE}`,
    });
  });

  test.each([['TimeoutError'], ['AbortError']])('%s becomes kind timeout', async (name) => {
    const fetchImpl = jest.fn().mockRejectedValue(new DOMException('timed out', name));
    await expect(client(fetchImpl).request('/api/v1/watch')).rejects.toMatchObject({
      kind: 'timeout',
      message: `Server did not respond within ${REQUEST_TIMEOUT_MS / 1000} s`,
    });
  });

  test('non-JSON body becomes kind invalid_response', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => { throw new SyntaxError('bad'); } });
    await expect(client(fetchImpl).request('/api/v1/watch')).rejects.toMatchObject({
      kind: 'invalid_response',
      status: 200,
      message: 'Server sent an invalid response (not JSON)',
    });
  });

  test('logs each request at debug level and never logs the API key', async () => {
    const fetchImpl = jest.fn().mockResolvedValueOnce(jsonResponse({})).mockRejectedValueOnce(new TypeError('x'));
    await client(fetchImpl).request('/api/v1/watch');
    await expect(client(fetchImpl).request('/api/v1/systeminfo')).rejects.toThrow();
    expect(hasLog('debug', /\[cdio:api\] GET \/api\/v1\/watch -> HTTP 200 in \d+ ms/)).toBe(true);
    expect(hasLog('debug', /\[cdio:api\] GET \/api\/v1\/systeminfo failed after \d+ ms: TypeError/)).toBe(true);
    expect(allLogText()).not.toContain(KEY);
  });

  test('defaults to the global fetch', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse([]));
    await new ChangeDetectionClient({ baseURL: BASE, apiKey: KEY }).request('/api/v1/watch');
    expect(globalThis.fetch).toHaveBeenCalledWith(`${BASE}/api/v1/watch`, expect.any(Object));
  });
});
```
2. Run `npx jest tests/lib/api.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/lib/api.test.js && git commit -m "test: add tests for API client request handling"`
4. Create `src/lib/api.js` with exactly this content:

```js
/**
 * @file Minimal client for the changedetection.io REST API v1.
 *
 * Every request sends the `x-api-key` header, times out after REQUEST_TIMEOUT_MS and turns
 * failures into an ApiError with a user-safe message (response bodies are never surfaced).
 * Requires changedetection.io 0.50.12 or newer, the first version that accepts `last_viewed`
 * in `PUT /api/v1/watch/{uuid}`.
 */
import { createLogger } from './log.js';

const log = createLogger('api');

export const REQUEST_TIMEOUT_MS = 15000;

/**
 * Failure of an API call, safe to show to the user.
 *
 * `kind` is one of 'auth', 'not_found', 'http', 'network', 'timeout', 'invalid_response' or
 * 'permission'; `status` is the HTTP status, 0 when no response was received.
 */
export class ApiError extends Error {
  /**
   * Create an ApiError.
   *
   * @param {string} message - User-safe description.
   * @param {{kind: string, status?: number}} details - Error category and HTTP status.
   */
  constructor(message, { kind, status = 0 }) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

/**
 * Map a non-2xx HTTP status to an ApiError.
 *
 * @param {number} status - HTTP status code.
 * @returns {ApiError} The error to throw.
 */
function httpError(status) {
  if (status === 401 || status === 403) {
    return new ApiError(`API key rejected (HTTP ${status})`, { kind: 'auth', status });
  }
  if (status === 404) {
    return new ApiError('API not found (HTTP 404). Check the server URL.', { kind: 'not_found', status });
  }
  return new ApiError(`Server error (HTTP ${status})`, { kind: 'http', status });
}

/** Client bound to one server URL and API key. */
export class ChangeDetectionClient {
  /**
   * Create a client.
   *
   * @param {{baseURL: string, apiKey: string, fetchImpl?: Function, timeoutMs?: number}} options - Normalized server URL, API key, optional fetch replacement and timeout.
   */
  constructor({ baseURL, apiKey, fetchImpl = (input, init) => globalThis.fetch(input, init), timeoutMs = REQUEST_TIMEOUT_MS }) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.fetchImpl = fetchImpl;
    this.timeoutMs = timeoutMs;
  }

  /**
   * Send one request and parse the JSON response.
   *
   * @param {string} path - Path starting with '/api/v1/'.
   * @param {{method?: string, body?: object}} [options] - HTTP method (default 'GET') and JSON body.
   * @returns {Promise<*>} Parsed response body.
   * @throws {ApiError} On timeout, network failure, non-2xx status or a non-JSON body.
   */
  async request(path, { method = 'GET', body } = {}) {
    const headers = { 'x-api-key': this.apiKey };
    const init = { method, headers, signal: AbortSignal.timeout(this.timeoutMs) };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
    const started = Date.now();
    let response;
    try {
      response = await this.fetchImpl(`${this.baseURL}${path}`, init);
    } catch (error) {
      log.debug('%s %s failed after %d ms: %s', method, path, Date.now() - started, error?.name);
      if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
        throw new ApiError(`Server did not respond within ${this.timeoutMs / 1000} s`, { kind: 'timeout' });
      }
      throw new ApiError(`Cannot reach ${this.baseURL}`, { kind: 'network' });
    }
    log.debug('%s %s -> HTTP %d in %d ms', method, path, response.status, Date.now() - started);
    if (!response.ok) throw httpError(response.status);
    try {
      return await response.json();
    } catch {
      throw new ApiError('Server sent an invalid response (not JSON)', { kind: 'invalid_response', status: response.status });
    }
  }
}
```
5. Light checks: `npm run lint` must exit 0, then `npx jest tests/lib/api.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
6. Commit: `git add src/lib/api.js && git commit -m "fix: add request timeout, typed errors and safe logging to the API client"`

**Context for Implementor**
`ApiError` (`src/lib/api.js`, `class ApiError extends Error`): `message` is user-safe; `kind` is one of `auth` (HTTP 401/403), `not_found` (404), `http` (other non-2xx), `network`, `timeout` (15 s), `invalid_response` (non-JSON body), `permission` (host access not granted); `status` is the HTTP status or 0.
- `AbortSignal.timeout` throws `AbortError` instead of `TimeoutError` on Chrome 103–123; both map to `timeout`.
- The next task adds the endpoint methods inside this class. Logging: only through `createLogger(scope)` from `src/lib/log.js` (ESLint `no-console` rejects `console.*` elsewhere). Lines start `[cdio:<scope>]`, use `%s`/`%d` placeholders, never include the API key.

**Acceptance Criteria**
- [ ] `npx jest tests/lib/api.test.js` passes (13 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 99 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-13: API client endpoints (single-PUT mark viewed)
**Type:** Optimisation
**Priority:** High
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/lib/api.test.js, src/lib/api.js

**Current State**
`updateWatchViewed()` issues a `GET /api/v1/watch/{uuid}` only to copy the `url` into the following `PUT` — twice the requests needed; changedetection.io ≥ 0.50.12 accepts `PUT {"last_viewed": n}` alone. It uses the local clock, so a browser clock behind the server can leave the watch unread. There are no endpoints for system info, creating a watch or rechecking.

**Target State**
Inside `class ChangeDetectionClient`, after `request()`:
- `listWatches()` → `GET /api/v1/watch`.
- `markViewed(uuid, lastChanged = 0)` → `PUT /api/v1/watch/<encodeURIComponent(uuid)>` with body `{last_viewed: Math.max(Math.floor(Date.now() / 1000), Number(lastChanged) || 0)}`.
- `systemInfo()` → `GET /api/v1/systeminfo` (fields used: `version`, `watch_count`).
- `createWatch(url)` → `POST /api/v1/watch` with `{url}` → `{uuid}` (HTTP 201).
- `recheckAll()` → `GET /api/v1/watch?recheck_all=1` → `{status}`.

Public surface after this task (exact names and parameters):
- `src/lib/api.js`: method `listWatches()`
- `src/lib/api.js`: method `async markViewed(uuid, lastChanged = 0)`
- `src/lib/api.js`: method `systemInfo()`
- `src/lib/api.js`: method `createWatch(url)`
- `src/lib/api.js`: method `recheckAll()`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/lib/api.test.js` › ChangeDetectionClient endpoints › listWatches GETs /api/v1/watch
- `tests/lib/api.test.js` › ChangeDetectionClient endpoints › markViewed PUTs last_viewed = now when now is later
- `tests/lib/api.test.js` › ChangeDetectionClient endpoints › markViewed uses lastChanged when the local clock is behind
- `tests/lib/api.test.js` › ChangeDetectionClient endpoints › systemInfo GETs /api/v1/systeminfo
- `tests/lib/api.test.js` › ChangeDetectionClient endpoints › createWatch POSTs the url
- `tests/lib/api.test.js` › ChangeDetectionClient endpoints › recheckAll GETs /api/v1/watch?recheck_all=1

**Implementation Steps**
1. Write the tests. Append the following to the end of `tests/lib/api.test.js` (keep everything already in the file):

```js
describe('ChangeDetectionClient endpoints', () => {
  test('listWatches GETs /api/v1/watch', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse({ u: {} }));
    expect(await client(fetchImpl).listWatches()).toEqual({ u: {} });
    expect(fetchImpl.mock.calls[0][0]).toBe(`${BASE}/api/v1/watch`);
  });

  test('markViewed PUTs last_viewed = now when now is later', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_500);
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse('OK'));
    await client(fetchImpl).markViewed('a/b', 1_600_000_000);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(`${BASE}/api/v1/watch/a%2Fb`);
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body)).toEqual({ last_viewed: 1_700_000_000 });
  });

  test('markViewed uses lastChanged when the local clock is behind', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse('OK'));
    await client(fetchImpl).markViewed('u', 1_700_000_100);
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toEqual({ last_viewed: 1_700_000_100 });
  });

  test('systemInfo GETs /api/v1/systeminfo', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse({ version: '0.50.12', watch_count: 3 }));
    expect(await client(fetchImpl).systemInfo()).toEqual({ version: '0.50.12', watch_count: 3 });
    expect(fetchImpl.mock.calls[0][0]).toBe(`${BASE}/api/v1/systeminfo`);
  });

  test('createWatch POSTs the url', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse({ uuid: 'new' }, 201));
    expect(await client(fetchImpl).createWatch('https://example.com')).toEqual({ uuid: 'new' });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(`${BASE}/api/v1/watch`);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ url: 'https://example.com' });
  });

  test('recheckAll GETs /api/v1/watch?recheck_all=1', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse({ status: 'OK, queued 3 watches for rechecking' }, 202));
    expect(await client(fetchImpl).recheckAll()).toEqual({ status: 'OK, queued 3 watches for rechecking' });
    expect(fetchImpl.mock.calls[0][0]).toBe(`${BASE}/api/v1/watch?recheck_all=1`);
  });
});
```
2. Run `npx jest tests/lib/api.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/lib/api.test.js && git commit -m "test: add tests for API client endpoints"`
4. In `src/lib/api.js`, replace this exact text (it occurs exactly once): This appends five methods inside class `ChangeDetectionClient`, after `request()`.

```js
      throw new ApiError('Server sent an invalid response (not JSON)', { kind: 'invalid_response', status: response.status });
    }
  }
}
```

with:

```js
      throw new ApiError('Server sent an invalid response (not JSON)', { kind: 'invalid_response', status: response.status });
    }
  }

  /**
   * Fetch every watch.
   *
   * @returns {Promise<object>} Raw response: an object keyed by watch UUID.
   */
  listWatches() {
    return this.request('/api/v1/watch');
  }

  /**
   * Mark one watch viewed by setting its last_viewed timestamp.
   *
   * @param {string} uuid - Watch UUID.
   * @param {number} [lastChanged] - The watch's last_changed; last_viewed is max(now, lastChanged) to absorb clock skew.
   * @returns {Promise<void>} Resolves when the server accepted the update.
   */
  async markViewed(uuid, lastChanged = 0) {
    const lastViewed = Math.max(Math.floor(Date.now() / 1000), Number(lastChanged) || 0);
    await this.request(`/api/v1/watch/${encodeURIComponent(uuid)}`, { method: 'PUT', body: { last_viewed: lastViewed } });
  }

  /**
   * Fetch server information (cheap; used by the connection test).
   *
   * @returns {Promise<{version: string, watch_count: number}>} Server version and watch count, among other fields.
   */
  systemInfo() {
    return this.request('/api/v1/systeminfo');
  }

  /**
   * Create a watch for a page.
   *
   * @param {string} url - Page URL to monitor.
   * @returns {Promise<{uuid: string}>} UUID of the new watch.
   */
  createWatch(url) {
    return this.request('/api/v1/watch', { method: 'POST', body: { url } });
  }

  /**
   * Queue a recheck of every watch.
   *
   * @returns {Promise<{status: string}>} Server status message, e.g. 'OK, queued 12 watches for rechecking'.
   */
  recheckAll() {
    return this.request('/api/v1/watch?recheck_all=1');
  }
}
```
5. Light checks: `npm run lint` must exit 0, then `npx jest tests/lib/api.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
6. Commit: `git add src/lib/api.js && git commit -m "perf: mark watches viewed with a single PUT and add client endpoints"`

**Context for Implementor**
- Server facts (changedetection.io source, verified at planning time): `PUT` needs no `url`; `last_viewed` ≥ newest snapshot marks the watch viewed; `recheck_all` answers 200 or 202 with `{"status": "OK, queued N watches for rechecking"}`; `POST` answers 201 `{uuid}`.
- The `Date.now()` in tests is mocked with `jest.spyOn(Date, 'now')`.

**Acceptance Criteria**
- [ ] `npx jest tests/lib/api.test.js` passes (19 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 105 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-14: Toolbar badge states: count, error, cleared
**Type:** Feature
**Priority:** High
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/lib/badge.test.js, src/lib/badge.js

**Current State**
`updateBadge()` shows a red `●` for any number of unread watches, never updates the tooltip, and on failure keeps the previous badge silently — a dead server or revoked key looks like "nothing new" forever.

**Target State**
New `src/lib/badge.js` exporting `DEFAULT_TITLE = 'ChangeDetection.io Monitor'`, `UNREAD_COLOR = '#d93025'`, `ERROR_COLOR = '#5f6368'` and:
- `badgeText(count)` → `''` for ≤ 0, the number up to 99, `'99+'` above.
- `showUnreadBadge(count)` → red background, `badgeText(count)`, tooltip `ChangeDetection.io Monitor — N unread` (plain `DEFAULT_TITLE` for 0).
- `showErrorBadge(message)` → grey background, text `!`, tooltip `ChangeDetection.io Monitor — <message>`.
- `clearBadge()` → empty text, default tooltip.
All use promise-style `chrome.action.*` and log one DEBUG line.

Public surface after this task (exact names and parameters):
- `src/lib/badge.js`: `export const DEFAULT_TITLE = 'ChangeDetection.io Monitor'`
- `src/lib/badge.js`: `export const UNREAD_COLOR = '#d93025'`
- `src/lib/badge.js`: `export const ERROR_COLOR = '#5f6368'`
- `src/lib/badge.js`: `export function badgeText(count)`
- `src/lib/badge.js`: `export async function showUnreadBadge(count)`
- `src/lib/badge.js`: `export async function showErrorBadge(message)`
- `src/lib/badge.js`: `export async function clearBadge()`

Log lines this task adds (level and exact format string, arguments as in the code below):
- DEBUG `Badge shows %d unread`
- DEBUG `Badge shows error: %s`
- DEBUG `Badge cleared`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/lib/badge.test.js` › badge states › showUnreadBadge shows the count in red with a count tooltip
- `tests/lib/badge.test.js` › badge states › showUnreadBadge(0) empties the badge and resets the tooltip
- `tests/lib/badge.test.js` › badge states › showErrorBadge shows a grey ! with the message in the tooltip
- `tests/lib/badge.test.js` › badge states › clearBadge empties text and resets the tooltip

**Implementation Steps**
1. Write the tests. Create `tests/lib/badge.test.js` with exactly this content:

```js
import {
  DEFAULT_TITLE,
  ERROR_COLOR,
  UNREAD_COLOR,
  badgeText,
  clearBadge,
  showErrorBadge,
  showUnreadBadge,
} from '../../src/lib/badge.js';

describe('badgeText', () => {
  test.each([
    [0, ''],
    [-1, ''],
    [1, '1'],
    [99, '99'],
    [100, '99+'],
  ])('%p -> %p', (count, expected) => {
    expect(badgeText(count)).toBe(expected);
  });
});

describe('badge states', () => {
  test('showUnreadBadge shows the count in red with a count tooltip', async () => {
    await showUnreadBadge(3);
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ color: UNREAD_COLOR });
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '3' });
    expect(chrome.action.setTitle).toHaveBeenCalledWith({ title: `${DEFAULT_TITLE} — 3 unread` });
  });

  test('showUnreadBadge(0) empties the badge and resets the tooltip', async () => {
    await showUnreadBadge(0);
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '' });
    expect(chrome.action.setTitle).toHaveBeenCalledWith({ title: DEFAULT_TITLE });
  });

  test('showErrorBadge shows a grey ! with the message in the tooltip', async () => {
    await showErrorBadge('API key rejected (HTTP 403)');
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ color: ERROR_COLOR });
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '!' });
    expect(chrome.action.setTitle).toHaveBeenCalledWith({ title: `${DEFAULT_TITLE} — API key rejected (HTTP 403)` });
  });

  test('clearBadge empties text and resets the tooltip', async () => {
    await clearBadge();
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '' });
    expect(chrome.action.setTitle).toHaveBeenCalledWith({ title: DEFAULT_TITLE });
  });
});
```
2. Run `npx jest tests/lib/badge.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/lib/badge.test.js && git commit -m "test: add tests for badge states"`
4. Create `src/lib/badge.js` with exactly this content:

```js
/**
 * @file Toolbar badge and tooltip: unread count, error marker, or cleared.
 */
import { createLogger } from './log.js';

const log = createLogger('badge');

export const DEFAULT_TITLE = 'ChangeDetection.io Monitor';
export const UNREAD_COLOR = '#d93025';
export const ERROR_COLOR = '#5f6368';

/**
 * Badge text for an unread count.
 *
 * @param {number} count - Number of unread watches.
 * @returns {string} '' for 0 or less, the number up to 99, '99+' above.
 */
export function badgeText(count) {
  if (count <= 0) return '';
  return count > 99 ? '99+' : String(count);
}

/**
 * Show the unread count on the toolbar icon.
 *
 * @param {number} count - Number of unread watches.
 * @returns {Promise<void>} Resolves when the badge is updated.
 */
export async function showUnreadBadge(count) {
  await chrome.action.setBadgeBackgroundColor({ color: UNREAD_COLOR });
  await chrome.action.setBadgeText({ text: badgeText(count) });
  await chrome.action.setTitle({ title: count > 0 ? `${DEFAULT_TITLE} — ${count} unread` : DEFAULT_TITLE });
  log.debug('Badge shows %d unread', count);
}

/**
 * Show a grey '!' badge with the error in the tooltip.
 *
 * @param {string} message - User-safe error message.
 * @returns {Promise<void>} Resolves when the badge is updated.
 */
export async function showErrorBadge(message) {
  await chrome.action.setBadgeBackgroundColor({ color: ERROR_COLOR });
  await chrome.action.setBadgeText({ text: '!' });
  await chrome.action.setTitle({ title: `${DEFAULT_TITLE} — ${message}` });
  log.debug('Badge shows error: %s', message);
}

/**
 * Remove the badge and reset the tooltip.
 *
 * @returns {Promise<void>} Resolves when the badge is cleared.
 */
export async function clearBadge() {
  await chrome.action.setBadgeText({ text: '' });
  await chrome.action.setTitle({ title: DEFAULT_TITLE });
  log.debug('Badge cleared');
}
```
5. Light checks: `npm run lint` must exit 0, then `npx jest tests/lib/badge.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
6. Commit: `git add src/lib/badge.js && git commit -m "feat: show unread count and error state on the badge"`

**Context for Implementor**
- The tooltip separator is an em dash with spaces (` — `) — keep it.
- The decision *when* to show the error badge (second consecutive failure) belongs to the refresh cycle, not to this module.

**Acceptance Criteria**
- [ ] `npx jest tests/lib/badge.test.js` passes (9 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 114 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-15: Refresh alarm scheduler without watchdog
**Type:** Bug Fix
**Priority:** High
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/lib/scheduler.test.js, src/lib/scheduler.js

**Current State**
The legacy worker creates an `alarmWatchdog` alarm at top level on every service-worker start; re-creating an alarm resets its timer, so with a 5-minute refresh the hourly watchdog never fires. Missing alarms are re-created in three different places. Chrome's documented pattern is simpler: check at every service-worker start and create the alarm if it is missing.

**Target State**
New `src/lib/scheduler.js` exporting `REFRESH_ALARM = 'refreshWatches'`, `LEGACY_ALARMS = ['updateBadge', 'alarmWatchdog']` and:
- `ensureRefreshAlarm(periodMinutes)` → keeps an existing alarm with the same `periodInMinutes` (returns `false`); otherwise creates `REFRESH_ALARM` with `{delayInMinutes: periodMinutes, periodInMinutes: periodMinutes}` and returns `true`.
- `clearLegacyAlarms()` → clears both legacy alarm names, logging each one actually removed.

Public surface after this task (exact names and parameters):
- `src/lib/scheduler.js`: `export const REFRESH_ALARM = 'refreshWatches'`
- `src/lib/scheduler.js`: `export const LEGACY_ALARMS = ['updateBadge', 'alarmWatchdog']`
- `src/lib/scheduler.js`: `export async function ensureRefreshAlarm(periodMinutes)`
- `src/lib/scheduler.js`: `export async function clearLegacyAlarms()`

Log lines this task adds (level and exact format string, arguments as in the code below):
- DEBUG `Refresh alarm already scheduled every %d min`
- INFO `Scheduled refresh every %d min`
- INFO `Removed legacy alarm %s`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/lib/scheduler.test.js` › ensureRefreshAlarm › creates the alarm when missing and logs at info
- `tests/lib/scheduler.test.js` › ensureRefreshAlarm › keeps an existing alarm with the same period
- `tests/lib/scheduler.test.js` › ensureRefreshAlarm › replaces an alarm with a different period
- `tests/lib/scheduler.test.js` › clearLegacyAlarms › clears updateBadge and alarmWatchdog and logs the removed ones

**Implementation Steps**
1. Write the tests. Create `tests/lib/scheduler.test.js` with exactly this content:

```js
import { LEGACY_ALARMS, REFRESH_ALARM, clearLegacyAlarms, ensureRefreshAlarm } from '../../src/lib/scheduler.js';
import { hasLog } from '../helpers/logs.js';

describe('ensureRefreshAlarm', () => {
  test('creates the alarm when missing and logs at info', async () => {
    expect(await ensureRefreshAlarm(5)).toBe(true);
    expect(chrome.alarms.create).toHaveBeenCalledWith(REFRESH_ALARM, { delayInMinutes: 5, periodInMinutes: 5 });
    expect(hasLog('info', '[cdio:scheduler] Scheduled refresh every 5 min')).toBe(true);
  });

  test('keeps an existing alarm with the same period', async () => {
    await chrome.alarms.create(REFRESH_ALARM, { periodInMinutes: 5 });
    chrome.alarms.create.mockClear();
    expect(await ensureRefreshAlarm(5)).toBe(false);
    expect(chrome.alarms.create).not.toHaveBeenCalled();
  });

  test('replaces an alarm with a different period', async () => {
    await chrome.alarms.create(REFRESH_ALARM, { periodInMinutes: 5 });
    expect(await ensureRefreshAlarm(15)).toBe(true);
    expect(await chrome.alarms.get(REFRESH_ALARM)).toEqual({ name: REFRESH_ALARM, delayInMinutes: 15, periodInMinutes: 15 });
  });
});

describe('clearLegacyAlarms', () => {
  test('clears updateBadge and alarmWatchdog and logs the removed ones', async () => {
    expect(LEGACY_ALARMS).toEqual(['updateBadge', 'alarmWatchdog']);
    await chrome.alarms.create('updateBadge', { periodInMinutes: 5 });
    await clearLegacyAlarms();
    expect(chrome.alarms.clear).toHaveBeenCalledWith('updateBadge');
    expect(chrome.alarms.clear).toHaveBeenCalledWith('alarmWatchdog');
    expect(hasLog('info', 'Removed legacy alarm updateBadge')).toBe(true);
    expect(hasLog('info', 'Removed legacy alarm alarmWatchdog')).toBe(false);
  });
});
```
2. Run `npx jest tests/lib/scheduler.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/lib/scheduler.test.js && git commit -m "test: add tests for the refresh alarm scheduler"`
4. Create `src/lib/scheduler.js` with exactly this content:

```js
/**
 * @file Periodic refresh alarm.
 *
 * Chrome may drop alarms when the browser restarts, so the service worker calls
 * ensureRefreshAlarm() every time it starts instead of relying on a watchdog.
 */
import { createLogger } from './log.js';

const log = createLogger('scheduler');

export const REFRESH_ALARM = 'refreshWatches';
export const LEGACY_ALARMS = ['updateBadge', 'alarmWatchdog'];

/**
 * Create the refresh alarm unless one with the same period already exists.
 *
 * @param {number} periodMinutes - Minutes between refreshes.
 * @returns {Promise<boolean>} True when the alarm was created or replaced.
 */
export async function ensureRefreshAlarm(periodMinutes) {
  const existing = await chrome.alarms.get(REFRESH_ALARM);
  if (existing && existing.periodInMinutes === periodMinutes) {
    log.debug('Refresh alarm already scheduled every %d min', periodMinutes);
    return false;
  }
  await chrome.alarms.create(REFRESH_ALARM, { delayInMinutes: periodMinutes, periodInMinutes: periodMinutes });
  log.info('Scheduled refresh every %d min', periodMinutes);
  return true;
}

/**
 * Delete the alarms used by version 1.0.1 and earlier.
 *
 * @returns {Promise<void>} Resolves when both legacy alarms are gone.
 */
export async function clearLegacyAlarms() {
  for (const name of LEGACY_ALARMS) {
    if (await chrome.alarms.clear(name)) log.info('Removed legacy alarm %s', name);
  }
}
```
5. Light checks: `npm run lint` must exit 0, then `npx jest tests/lib/scheduler.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
6. Commit: `git add src/lib/scheduler.js && git commit -m "fix: ensure the refresh alarm at start-up and drop the watchdog"`

**Context for Implementor**
- Chrome may drop alarms when the browser restarts; the service worker (later task) calls `ensureRefreshAlarm` from its top-level start-up code and on install/startup, which replaces the watchdog.
- `chrome.alarms.clear` resolves `true` only when the alarm existed.

**Acceptance Criteria**
- [ ] `npx jest tests/lib/scheduler.test.js` passes (4 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 118 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-16: Session watch cache
**Type:** Optimisation
**Priority:** Medium
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/lib/cache.test.js, src/lib/cache.js

**Current State**
Every popup opening shows a spinner and waits for a full `GET /api/v1/watch`; marking a watch viewed triggers two more full list fetches (one by the worker, one requested by the popup) just to update the badge.

**Target State**
New `src/lib/cache.js` backed by `chrome.storage.session` (readable by the popup and the worker, cleared when the browser restarts), exporting `CACHE_KEY = 'watchCache'`, the `WatchCache` typedef and:
- `readWatchCache()` → `{watches, fetchedAt}` or `null` when missing or `watches` is not an array.
- `writeWatchCache(watches, fetchedAt = Date.now())`.
- `clearWatchCache()`.
- `markCachedViewed(uuids)` → sets `viewed: true` on matching cached watches, keeps `fetchedAt`, returns the updated array (or `null` without a cache) so the badge can be recomputed without a refetch.

Public surface after this task (exact names and parameters):
- `src/lib/cache.js`: `export const CACHE_KEY = 'watchCache'`
- `src/lib/cache.js`: `export async function readWatchCache()`
- `src/lib/cache.js`: `export async function writeWatchCache(watches, fetchedAt = Date.now()`
- `src/lib/cache.js`: `export async function clearWatchCache()`
- `src/lib/cache.js`: `export async function markCachedViewed(uuids)`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/lib/cache.test.js` › watch cache › readWatchCache returns null when empty
- `tests/lib/cache.test.js` › watch cache › write then read round-trips via chrome.storage.session
- `tests/lib/cache.test.js` › watch cache › writeWatchCache defaults fetchedAt to Date.now()
- `tests/lib/cache.test.js` › watch cache › readWatchCache ignores malformed data
- `tests/lib/cache.test.js` › watch cache › clearWatchCache removes the entry
- `tests/lib/cache.test.js` › watch cache › markCachedViewed flags the given UUIDs and keeps fetchedAt
- `tests/lib/cache.test.js` › watch cache › markCachedViewed returns null without a cache

**Implementation Steps**
1. Write the tests. Create `tests/lib/cache.test.js` with exactly this content:

```js
import { CACHE_KEY, clearWatchCache, markCachedViewed, readWatchCache, writeWatchCache } from '../../src/lib/cache.js';

const WATCHES = [
  { uuid: 'a', url: 'https://a', last_changed: 10, viewed: false },
  { uuid: 'b', url: 'https://b', last_changed: 20, viewed: false },
];

describe('watch cache', () => {
  test('readWatchCache returns null when empty', async () => {
    expect(await readWatchCache()).toBeNull();
  });

  test('write then read round-trips via chrome.storage.session', async () => {
    await writeWatchCache(WATCHES, 1234);
    expect(chrome.storage.session.set).toHaveBeenCalledWith({ [CACHE_KEY]: { watches: WATCHES, fetchedAt: 1234 } });
    expect(await readWatchCache()).toEqual({ watches: WATCHES, fetchedAt: 1234 });
  });

  test('writeWatchCache defaults fetchedAt to Date.now()', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(999);
    await writeWatchCache([]);
    expect(await readWatchCache()).toEqual({ watches: [], fetchedAt: 999 });
  });

  test('readWatchCache ignores malformed data', async () => {
    await chrome.storage.session.set({ [CACHE_KEY]: { watches: 'nope' } });
    expect(await readWatchCache()).toBeNull();
  });

  test('clearWatchCache removes the entry', async () => {
    await writeWatchCache(WATCHES, 1);
    await clearWatchCache();
    expect(await readWatchCache()).toBeNull();
  });

  test('markCachedViewed flags the given UUIDs and keeps fetchedAt', async () => {
    await writeWatchCache(WATCHES, 55);
    const updated = await markCachedViewed(['b']);
    expect(updated.map((w) => w.viewed)).toEqual([false, true]);
    expect(await readWatchCache()).toEqual({ watches: updated, fetchedAt: 55 });
  });

  test('markCachedViewed returns null without a cache', async () => {
    expect(await markCachedViewed(['a'])).toBeNull();
  });
});
```
2. Run `npx jest tests/lib/cache.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/lib/cache.test.js && git commit -m "test: add tests for the session watch cache"`
4. Create `src/lib/cache.js` with exactly this content:

```js
/**
 * @file Last fetched watch list, kept in chrome.storage.session so the popup renders instantly.
 *
 * Session storage is readable by the popup and the service worker and is cleared when the
 * browser restarts.
 */

export const CACHE_KEY = 'watchCache';

/**
 * Cached watch list.
 *
 * @typedef {object} WatchCache
 * @property {import('./watches.js').Watch[]} watches - Watches from the last successful refresh.
 * @property {number} fetchedAt - When they were fetched, in milliseconds since the epoch.
 */

/**
 * Read the cached watch list.
 *
 * @returns {Promise<WatchCache|null>} The cache, or null when missing or malformed.
 */
export async function readWatchCache() {
  const { [CACHE_KEY]: cache } = await chrome.storage.session.get(CACHE_KEY);
  return cache && Array.isArray(cache.watches) ? cache : null;
}

/**
 * Replace the cached watch list.
 *
 * @param {import('./watches.js').Watch[]} watches - Watches to cache.
 * @param {number} [fetchedAt] - Fetch time in milliseconds; defaults to Date.now().
 * @returns {Promise<void>} Resolves when stored.
 */
export async function writeWatchCache(watches, fetchedAt = Date.now()) {
  await chrome.storage.session.set({ [CACHE_KEY]: { watches, fetchedAt } });
}

/**
 * Delete the cached watch list.
 *
 * @returns {Promise<void>} Resolves when removed.
 */
export async function clearWatchCache() {
  await chrome.storage.session.remove(CACHE_KEY);
}

/**
 * Set viewed = true on cached watches.
 *
 * @param {string[]} uuids - UUIDs of the watches just marked viewed.
 * @returns {Promise<import('./watches.js').Watch[]|null>} The updated watches, or null when there is no cache.
 */
export async function markCachedViewed(uuids) {
  const cache = await readWatchCache();
  if (!cache) return null;
  const marked = new Set(uuids);
  const watches = cache.watches.map((watch) => (marked.has(watch.uuid) ? { ...watch, viewed: true } : watch));
  await writeWatchCache(watches, cache.fetchedAt);
  return watches;
}
```
5. Light checks: `npm run lint` must exit 0, then `npx jest tests/lib/cache.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
6. Commit: `git add src/lib/cache.js && git commit -m "perf: cache the last watch list in session storage"`

**Context for Implementor**
Storage keys: `chrome.storage.sync` — `baseURL` (normalized, no trailing slash), `apiKey`, `refreshInterval` (integer minutes 1–1440, default 5), `notificationsEnabled` (boolean, default false); `chrome.storage.session` — `watchCache` `{watches, fetchedAt}` and `refreshFailureCount` (number); `chrome.storage.local` — `notifiedUuids` (string[]).
- JSDoc rule: a type defined with `@typedef` in another file must be written `import('./watches.js').Watch` (or the right relative path); a bare `Watch` fails `jsdoc/no-undefined-types`.

**Acceptance Criteria**
- [ ] `npx jest tests/lib/cache.test.js` passes (7 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 125 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-17: Message contract module
**Type:** Refactor
**Priority:** Medium
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/lib/messages.test.js, src/lib/messages.js

**Current State**
Action names are string literals scattered across three files (`'getWatches'`, `'markAsRead'`, `'updateWatchViewed'`, `'updateBadge'`, `'testConnection'`); `markAsRead` and `updateWatchViewed` are duplicates. `sendMessage` wrappers are copy-pasted in popup and options and use callbacks, which log "Unchecked runtime.lastError" when the worker is unavailable.

**Target State**
New `src/lib/messages.js` exporting the frozen `ACTIONS` object (`GET_WATCHES: 'getWatches'`, `OPEN_WATCH: 'openWatch'`, `MARK_ALL_VIEWED: 'markAllViewed'`, `TEST_CONNECTION: 'testConnection'`, `ADD_WATCH: 'addWatch'`, `RECHECK_ALL: 'recheckAll'`), the `MessageResponse` typedef, and `sendMessage(message)` that awaits `chrome.runtime.sendMessage` and never throws: `undefined` → `{success: false, error: 'No response from the background service worker'}`; a rejection → `{success: false, error: error.message}`.

Public surface after this task (exact names and parameters):
- `src/lib/messages.js`: `export const ACTIONS = Object.freeze({`
- `src/lib/messages.js`: `export async function sendMessage(message)`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/lib/messages.test.js` › ACTIONS › lists every action with its wire name and is frozen
- `tests/lib/messages.test.js` › sendMessage › returns the service worker response
- `tests/lib/messages.test.js` › sendMessage › turns a missing response into a failure
- `tests/lib/messages.test.js` › sendMessage › turns a rejected send into a failure

**Implementation Steps**
1. Write the tests. Create `tests/lib/messages.test.js` with exactly this content:

```js
import { ACTIONS, sendMessage } from '../../src/lib/messages.js';

describe('ACTIONS', () => {
  test('lists every action with its wire name and is frozen', () => {
    expect(ACTIONS).toEqual({
      GET_WATCHES: 'getWatches',
      OPEN_WATCH: 'openWatch',
      MARK_ALL_VIEWED: 'markAllViewed',
      TEST_CONNECTION: 'testConnection',
      ADD_WATCH: 'addWatch',
      RECHECK_ALL: 'recheckAll',
    });
    expect(Object.isFrozen(ACTIONS)).toBe(true);
  });
});

describe('sendMessage', () => {
  test('returns the service worker response', async () => {
    chrome.runtime.sendMessage.mockResolvedValueOnce({ success: true, data: 1 });
    expect(await sendMessage({ action: ACTIONS.GET_WATCHES })).toEqual({ success: true, data: 1 });
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ action: 'getWatches' });
  });

  test('turns a missing response into a failure', async () => {
    chrome.runtime.sendMessage.mockResolvedValueOnce(undefined);
    expect(await sendMessage({ action: 'x' })).toEqual({
      success: false,
      error: 'No response from the background service worker',
    });
  });

  test('turns a rejected send into a failure', async () => {
    chrome.runtime.sendMessage.mockRejectedValueOnce(new Error('Receiving end does not exist.'));
    expect(await sendMessage({ action: 'x' })).toEqual({ success: false, error: 'Receiving end does not exist.' });
  });
});
```
2. Run `npx jest tests/lib/messages.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/lib/messages.test.js && git commit -m "test: add tests for the message contract"`
4. Create `src/lib/messages.js` with exactly this content:

```js
/**
 * @file Message contract between the popup/options pages and the background service worker.
 *
 * Requests are `{action: ACTIONS.X, ...fields}`. Every response is either
 * `{success: true, data?}` or `{success: false, error, errorKind?}`.
 */

export const ACTIONS = Object.freeze({
  GET_WATCHES: 'getWatches',
  OPEN_WATCH: 'openWatch',
  MARK_ALL_VIEWED: 'markAllViewed',
  TEST_CONNECTION: 'testConnection',
  ADD_WATCH: 'addWatch',
  RECHECK_ALL: 'recheckAll',
});

/**
 * Response envelope returned by the service worker.
 *
 * @typedef {object} MessageResponse
 * @property {boolean} success - Whether the action succeeded.
 * @property {*} [data] - Action result on success.
 * @property {string} [error] - User-safe error message on failure.
 * @property {string} [errorKind] - ApiError kind on failure, e.g. 'permission'.
 */

/**
 * Send a message to the service worker; never throws.
 *
 * @param {object} message - Request with an `action` field from ACTIONS.
 * @returns {Promise<MessageResponse>} The response, or a failure envelope when messaging fails.
 */
export async function sendMessage(message) {
  try {
    const response = await chrome.runtime.sendMessage(message);
    return response ?? { success: false, error: 'No response from the background service worker' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```
5. Light checks: `npm run lint` must exit 0, then `npx jest tests/lib/messages.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
6. Commit: `git add src/lib/messages.js && git commit -m "refactor: centralise message actions and a non-throwing sendMessage"`

**Context for Implementor**
Message contract (`src/lib/messages.js` `ACTIONS`; the popup/options pages send, the service worker answers `{success: true, data?}` or `{success: false, error, errorKind?}`):
- `getWatches` `{}` → data `{watches: Watch[], fetchedAt: number}` (runs a full refresh).
- `openWatch` `{uuid, url, lastChanged, background}` → no data (opens the tab; marks viewed when `lastChanged > 0`).
- `markAllViewed` `{items: [{uuid, lastChanged}]}` → data `{markedUuids: string[], failed: number}`.
- `testConnection` `{baseURL, apiKey}` → data `{version: string, watchCount: number}` (nothing is saved).
- `addWatch` `{url}` → data `{uuid: string}`.
- `recheckAll` `{}` → data `{message: string}`.

**Acceptance Criteria**
- [ ] `npx jest tests/lib/messages.test.js` passes (4 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 129 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-18: Opt-in change notifications module
**Type:** Feature
**Priority:** Medium
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/lib/notify.test.js, src/lib/notify.js

**Current State**
There are no desktop notifications; the user only learns about changes by looking at the badge.

**Target State**
New `src/lib/notify.js` exporting `NOTIFIED_KEY = 'notifiedUuids'`, `WATCH_NOTIFICATION_PREFIX = 'cdio-watch:'`, `SUMMARY_NOTIFICATION_ID = 'cdio-changes'`, `MAX_TITLES = 3` and:
- `notifyNewChanges(watches, enabled)` → always stores the UUIDs of unread watches in `chrome.storage.local[NOTIFIED_KEY]`; first run (no stored array) only records the baseline and returns 0; returns 0 when disabled or nothing new; warns and returns 0 when `chrome.notifications` is absent or the `notifications` permission is not granted; otherwise creates ONE notification — id `cdio-watch:<uuid>` titled `Watch changed` for a single change, else id `cdio-changes` titled `N watches changed`; message = up to three display titles joined with `, ` plus ` and K more`; icon `chrome.runtime.getURL('icons/icon128.png')` — and returns the count.
- `notificationTarget(notificationId, baseURL)` → diff URL for `cdio-watch:` ids, `baseURL` otherwise.

Public surface after this task (exact names and parameters):
- `src/lib/notify.js`: `export const NOTIFIED_KEY = 'notifiedUuids'`
- `src/lib/notify.js`: `export const WATCH_NOTIFICATION_PREFIX = 'cdio-watch:'`
- `src/lib/notify.js`: `export const SUMMARY_NOTIFICATION_ID = 'cdio-changes'`
- `src/lib/notify.js`: `export const MAX_TITLES = 3`
- `src/lib/notify.js`: `export async function notifyNewChanges(watches, enabled)`
- `src/lib/notify.js`: `export function notificationTarget(notificationId, baseURL)`

Log lines this task adds (level and exact format string, arguments as in the code below):
- DEBUG `Stored notification baseline: %d unread`
- WARN `Notifications are on but Chrome permission is missing; %d changes not shown`
- INFO `Notified %d changed watches`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/lib/notify.test.js` › notifyNewChanges › first run stores a baseline and never notifies
- `tests/lib/notify.test.js` › notifyNewChanges › disabled: updates the baseline without notifying
- `tests/lib/notify.test.js` › notifyNewChanges › one new change: single-watch notification with the diff id
- `tests/lib/notify.test.js` › notifyNewChanges › several new changes: one summary notification listing up to 3 titles
- `tests/lib/notify.test.js` › notifyNewChanges › read and never-changed watches are not announced
- `tests/lib/notify.test.js` › notifyNewChanges › missing permission warns and skips
- `tests/lib/notify.test.js` › notifyNewChanges › missing chrome.notifications API warns and skips
- `tests/lib/notify.test.js` › notificationTarget › single-watch id opens the diff page
- `tests/lib/notify.test.js` › notificationTarget › summary id opens the server

**Implementation Steps**
1. Write the tests. Create `tests/lib/notify.test.js` with exactly this content:

```js
import {
  NOTIFIED_KEY,
  SUMMARY_NOTIFICATION_ID,
  WATCH_NOTIFICATION_PREFIX,
  notificationTarget,
  notifyNewChanges,
} from '../../src/lib/notify.js';
import { hasLog } from '../helpers/logs.js';

/**
 * Build an unread watch.
 *
 * @param {string} uuid - UUID.
 * @param {string} title - Title.
 * @returns {object} Watch.
 */
function unread(uuid, title) {
  return { uuid, title, url: `https://${uuid}`, last_changed: 100, viewed: false };
}

describe('notifyNewChanges', () => {
  test('first run stores a baseline and never notifies', async () => {
    expect(await notifyNewChanges([unread('a', 'A')], true)).toBe(0);
    expect(await chrome.storage.local.get(NOTIFIED_KEY)).toEqual({ [NOTIFIED_KEY]: ['a'] });
    expect(chrome.notifications.create).not.toHaveBeenCalled();
  });

  test('disabled: updates the baseline without notifying', async () => {
    await chrome.storage.local.set({ [NOTIFIED_KEY]: [] });
    expect(await notifyNewChanges([unread('a', 'A')], false)).toBe(0);
    expect(chrome.notifications.create).not.toHaveBeenCalled();
    expect(await chrome.storage.local.get(NOTIFIED_KEY)).toEqual({ [NOTIFIED_KEY]: ['a'] });
  });

  test('one new change: single-watch notification with the diff id', async () => {
    await chrome.storage.local.set({ [NOTIFIED_KEY]: ['old'] });
    expect(await notifyNewChanges([unread('old', 'Old'), unread('a', 'Alpha')], true)).toBe(1);
    expect(chrome.notifications.create).toHaveBeenCalledWith(`${WATCH_NOTIFICATION_PREFIX}a`, {
      type: 'basic',
      iconUrl: 'chrome-extension://test-id/icons/icon128.png',
      title: 'Watch changed',
      message: 'Alpha',
    });
    expect(hasLog('info', '[cdio:notify] Notified 1 changed watches')).toBe(true);
  });

  test('several new changes: one summary notification listing up to 3 titles', async () => {
    await chrome.storage.local.set({ [NOTIFIED_KEY]: [] });
    const watches = ['a', 'b', 'c', 'd', 'e'].map((id) => unread(id, id.toUpperCase()));
    expect(await notifyNewChanges(watches, true)).toBe(5);
    expect(chrome.notifications.create).toHaveBeenCalledWith(SUMMARY_NOTIFICATION_ID, expect.objectContaining({
      title: '5 watches changed',
      message: 'A, B, C and 2 more',
    }));
  });

  test('read and never-changed watches are not announced', async () => {
    await chrome.storage.local.set({ [NOTIFIED_KEY]: [] });
    const watches = [{ uuid: 'r', last_changed: 5, viewed: true }, { uuid: 'n', last_changed: 0, viewed: false }];
    expect(await notifyNewChanges(watches, true)).toBe(0);
    expect(chrome.notifications.create).not.toHaveBeenCalled();
  });

  test('missing permission warns and skips', async () => {
    await chrome.storage.local.set({ [NOTIFIED_KEY]: [] });
    chrome.permissions.contains.mockResolvedValueOnce(false);
    expect(await notifyNewChanges([unread('a', 'A')], true)).toBe(0);
    expect(chrome.notifications.create).not.toHaveBeenCalled();
    expect(hasLog('warn', 'Notifications are on but Chrome permission is missing; 1 changes not shown')).toBe(true);
  });

  test('missing chrome.notifications API warns and skips', async () => {
    await chrome.storage.local.set({ [NOTIFIED_KEY]: [] });
    const api = chrome.notifications;
    delete chrome.notifications;
    try {
      expect(await notifyNewChanges([unread('a', 'A')], true)).toBe(0);
    } finally {
      chrome.notifications = api;
    }
    expect(hasLog('warn', 'permission is missing')).toBe(true);
  });
});

describe('notificationTarget', () => {
  test('single-watch id opens the diff page', () => {
    expect(notificationTarget(`${WATCH_NOTIFICATION_PREFIX}a/b`, 'http://h:5000')).toBe('http://h:5000/diff/a%2Fb');
  });

  test('summary id opens the server', () => {
    expect(notificationTarget(SUMMARY_NOTIFICATION_ID, 'http://h:5000')).toBe('http://h:5000');
  });
});
```
2. Run `npx jest tests/lib/notify.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/lib/notify.test.js && git commit -m "test: add tests for change notifications"`
4. Create `src/lib/notify.js` with exactly this content:

```js
/**
 * @file Opt-in desktop notifications for watches that changed since the previous refresh.
 *
 * Every refresh stores the UUIDs of currently unread watches in chrome.storage.local under
 * NOTIFIED_KEY, so enabling notifications never announces old changes, and a watch is
 * announced again only after it was viewed and then changed again.
 */
import { createLogger } from './log.js';
import { displayTitle, isUnread } from './watches.js';

const log = createLogger('notify');

export const NOTIFIED_KEY = 'notifiedUuids';
export const WATCH_NOTIFICATION_PREFIX = 'cdio-watch:';
export const SUMMARY_NOTIFICATION_ID = 'cdio-changes';
export const MAX_TITLES = 3;

/**
 * Announce watches that became unread since the previous refresh.
 *
 * @param {import('./watches.js').Watch[]} watches - Freshly fetched watches.
 * @param {boolean} enabled - The notificationsEnabled setting.
 * @returns {Promise<number>} Number of watches announced; 0 when disabled, nothing is new, or permission is missing.
 */
export async function notifyNewChanges(watches, enabled) {
  const unread = watches.filter(isUnread);
  const { [NOTIFIED_KEY]: previous } = await chrome.storage.local.get(NOTIFIED_KEY);
  await chrome.storage.local.set({ [NOTIFIED_KEY]: unread.map((watch) => watch.uuid) });
  if (!Array.isArray(previous)) {
    log.debug('Stored notification baseline: %d unread', unread.length);
    return 0;
  }
  const fresh = unread.filter((watch) => !previous.includes(watch.uuid));
  if (!enabled || fresh.length === 0) return 0;
  if (!chrome.notifications || !(await chrome.permissions.contains({ permissions: ['notifications'] }))) {
    log.warn('Notifications are on but Chrome permission is missing; %d changes not shown', fresh.length);
    return 0;
  }
  const names = fresh.slice(0, MAX_TITLES).map(displayTitle);
  const more = fresh.length - names.length;
  const id = fresh.length === 1 ? `${WATCH_NOTIFICATION_PREFIX}${fresh[0].uuid}` : SUMMARY_NOTIFICATION_ID;
  await chrome.notifications.create(id, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon128.png'),
    title: fresh.length === 1 ? 'Watch changed' : `${fresh.length} watches changed`,
    message: more > 0 ? `${names.join(', ')} and ${more} more` : names.join(', '),
  });
  log.info('Notified %d changed watches', fresh.length);
  return fresh.length;
}

/**
 * URL to open when a notification is clicked.
 *
 * @param {string} notificationId - ID passed to chrome.notifications.create.
 * @param {string} baseURL - Normalized server URL.
 * @returns {string} The diff page for a single-watch notification, otherwise baseURL.
 */
export function notificationTarget(notificationId, baseURL) {
  if (notificationId.startsWith(WATCH_NOTIFICATION_PREFIX)) {
    const uuid = notificationId.slice(WATCH_NOTIFICATION_PREFIX.length);
    return `${baseURL}/diff/${encodeURIComponent(uuid)}`;
  }
  return baseURL;
}
```
5. Light checks: `npm run lint` must exit 0, then `npx jest tests/lib/notify.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
6. Commit: `git add src/lib/notify.js && git commit -m "feat: add opt-in notifications for newly changed watches"`

**Context for Implementor**
Storage keys: `chrome.storage.sync` — `baseURL` (normalized, no trailing slash), `apiKey`, `refreshInterval` (integer minutes 1–1440, default 5), `notificationsEnabled` (boolean, default false); `chrome.storage.session` — `watchCache` `{watches, fetchedAt}` and `refreshFailureCount` (number); `chrome.storage.local` — `notifiedUuids` (string[]).
- The baseline is recorded on every refresh even while notifications are off, so turning them on never floods old changes; a watch is announced again only after it was viewed and changed again.
- `chrome.notifications` exists only after the optional permission is granted — hence the existence check.
- Watch object = one value of `GET /api/v1/watch` (an object keyed by UUID) plus `uuid`: `url`, `title` (string|null), `page_title` (string|null), `link`, `open_link`, `last_changed` (Unix seconds; 0 until the watch has two snapshots), `last_checked`, `last_error` (string or false), `viewed` (boolean — a brand-new watch reports false). Unread ⇔ `last_changed > 0 && viewed === false`.

**Acceptance Criteria**
- [ ] `npx jest tests/lib/notify.test.js` passes (9 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 138 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-19: Refresh cycle with failure counter
**Type:** Feature
**Priority:** High
**Effort:** Medium (1–2 h)
**Tier:** Haiku
**Files:** tests/lib/refresh.test.js, src/lib/refresh.js

**Current State**
`updateBadge()` in the legacy worker fetches the list, normalises it (second copy of that logic) and sets the badge; when unconfigured it throws and logs an error every 5 minutes; failures are never counted or shown; the popup's own fetch path does not update the badge at all.

**Target State**
New `src/lib/refresh.js` exporting `FAILURE_COUNT_KEY = 'refreshFailureCount'`, `FAILURES_BEFORE_ERROR_BADGE = 2`, the `RefreshResult` typedef and `refreshWatches(reason)`:
1. `loadSettings()`; not configured → `clearBadge()`, DEBUG log, return `{configured: false, watches: [], fetchedAt: Date.now()}` without any request.
2. No host permission → `ApiError('Access to <baseURL> is not granted', {kind: 'permission'})`.
3. `normalizeWatchList(await new ChangeDetectionClient(settings).listWatches())`.
4. On any failure: private `recordFailure` increments `chrome.storage.session[FAILURE_COUNT_KEY]`; first failure → WARN and keep the badge; from the second → `showErrorBadge(error.message)` + ERROR log; then rethrow.
5. On success: reset the counter to 0, `writeWatchCache`, `showUnreadBadge(countUnread)`, `notifyNewChanges(watches, settings.notificationsEnabled)` (a notification error only logs WARN), INFO log, return `{configured: true, watches, fetchedAt}`.

Public surface after this task (exact names and parameters):
- `src/lib/refresh.js`: `export const FAILURE_COUNT_KEY = 'refreshFailureCount'`
- `src/lib/refresh.js`: `export const FAILURES_BEFORE_ERROR_BADGE = 2`
- `src/lib/refresh.js`: `export async function refreshWatches(reason)`

Log lines this task adds (level and exact format string, arguments as in the code below):
- DEBUG `Refresh skipped (%s): server URL or API key not set`
- WARN `Could not show notification: %s`
- INFO `Refreshed watches (%s): %d watches, %d unread in %d ms`
- ERROR `Refresh failed (%s), %d times in a row: %s`
- WARN `Refresh failed (%s), keeping previous badge: %s`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/lib/refresh.test.js` › refreshWatches › not configured: clears the badge, fetches nothing
- `tests/lib/refresh.test.js` › refreshWatches › success: returns watches, caches them, shows the unread count, resets failures, logs info
- `tests/lib/refresh.test.js` › refreshWatches › missing host permission fails with kind permission before fetching
- `tests/lib/refresh.test.js` › refreshWatches › first failure keeps the badge and warns; second shows ! and logs error
- `tests/lib/refresh.test.js` › refreshWatches › an unexpected response format counts as a failure
- `tests/lib/refresh.test.js` › refreshWatches › stores the notification baseline on success
- `tests/lib/refresh.test.js` › refreshWatches › a notification failure is logged and does not fail the refresh

**Implementation Steps**
1. Write the tests. Create `tests/lib/refresh.test.js` with exactly this content:

```js
import { readWatchCache } from '../../src/lib/cache.js';
import { NOTIFIED_KEY } from '../../src/lib/notify.js';
import { FAILURE_COUNT_KEY, refreshWatches } from '../../src/lib/refresh.js';
import { hasLog } from '../helpers/logs.js';

const BASE = 'http://192.168.1.10:5000';
const LIST = {
  a: { url: 'https://a', title: 'A', last_changed: 100, viewed: false },
  b: { url: 'https://b', title: 'B', last_changed: 0, viewed: false },
};

/**
 * Store a complete configuration.
 *
 * @param {object} extra - Extra settings.
 * @returns {Promise<void>} Done.
 */
function configure(extra = {}) {
  return chrome.storage.sync.set({ baseURL: BASE, apiKey: 'key', ...extra });
}

/**
 * Make the global fetch answer with a JSON body.
 *
 * @param {*} body - JSON body.
 * @param {number} status - HTTP status.
 */
function respond(body, status = 200) {
  globalThis.fetch.mockResolvedValue({ ok: status < 300, status, json: async () => body });
}

describe('refreshWatches', () => {
  test('not configured: clears the badge, fetches nothing', async () => {
    const result = await refreshWatches('alarm');
    expect(result.configured).toBe(false);
    expect(result.watches).toEqual([]);
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '' });
    expect(hasLog('debug', 'Refresh skipped (alarm): server URL or API key not set')).toBe(true);
  });

  test('success: returns watches, caches them, shows the unread count, resets failures, logs info', async () => {
    await configure();
    await chrome.storage.session.set({ [FAILURE_COUNT_KEY]: 1 });
    respond(LIST);
    const result = await refreshWatches('alarm');
    expect(result.configured).toBe(true);
    expect(result.watches.map((w) => w.uuid)).toEqual(['a', 'b']);
    expect(globalThis.fetch).toHaveBeenCalledWith(`${BASE}/api/v1/watch`, expect.any(Object));
    expect((await readWatchCache()).watches).toEqual(result.watches);
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '1' });
    expect(await chrome.storage.session.get(FAILURE_COUNT_KEY)).toEqual({ [FAILURE_COUNT_KEY]: 0 });
    expect(hasLog('info', /\[cdio:refresh\] Refreshed watches \(alarm\): 2 watches, 1 unread in \d+ ms/)).toBe(true);
  });

  test('missing host permission fails with kind permission before fetching', async () => {
    await configure();
    chrome.permissions.contains.mockResolvedValueOnce(false);
    await expect(refreshWatches('popup')).rejects.toMatchObject({
      kind: 'permission',
      message: `Access to ${BASE} is not granted`,
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(chrome.permissions.contains).toHaveBeenCalledWith({ origins: ['http://192.168.1.10/*'] });
  });

  test('first failure keeps the badge and warns; second shows ! and logs error', async () => {
    await configure();
    respond('nope', 403);
    await expect(refreshWatches('alarm')).rejects.toMatchObject({ kind: 'auth' });
    expect(chrome.action.setBadgeText).not.toHaveBeenCalled();
    expect(hasLog('warn', 'Refresh failed (alarm), keeping previous badge: API key rejected (HTTP 403)')).toBe(true);

    await expect(refreshWatches('alarm')).rejects.toMatchObject({ kind: 'auth' });
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '!' });
    expect(chrome.action.setTitle).toHaveBeenCalledWith({
      title: 'ChangeDetection.io Monitor — API key rejected (HTTP 403)',
    });
    expect(hasLog('error', 'Refresh failed (alarm), 2 times in a row: API key rejected (HTTP 403)')).toBe(true);
    expect(await chrome.storage.session.get(FAILURE_COUNT_KEY)).toEqual({ [FAILURE_COUNT_KEY]: 2 });
  });

  test('an unexpected response format counts as a failure', async () => {
    await configure();
    respond([]);
    await expect(refreshWatches('alarm')).rejects.toThrow('Unexpected watch list format from server');
    expect(await chrome.storage.session.get(FAILURE_COUNT_KEY)).toEqual({ [FAILURE_COUNT_KEY]: 1 });
  });

  test('stores the notification baseline on success', async () => {
    await configure();
    respond(LIST);
    await refreshWatches('alarm');
    expect(await chrome.storage.local.get(NOTIFIED_KEY)).toEqual({ [NOTIFIED_KEY]: ['a'] });
  });

  test('a notification failure is logged and does not fail the refresh', async () => {
    await configure({ notificationsEnabled: true });
    await chrome.storage.local.set({ [NOTIFIED_KEY]: [] });
    chrome.notifications.create.mockRejectedValueOnce(new Error('bad icon'));
    respond(LIST);
    const result = await refreshWatches('alarm');
    expect(result.configured).toBe(true);
    expect(hasLog('warn', 'Could not show notification: bad icon')).toBe(true);
  });
});
```
2. Run `npx jest tests/lib/refresh.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/lib/refresh.test.js && git commit -m "test: add tests for the refresh cycle"`
4. Create `src/lib/refresh.js` with exactly this content:

```js
/**
 * @file The refresh cycle: fetch every watch, then update the failure counter, cache, badge
 * and notifications.
 *
 * Triggered by the alarm, the popup, browser startup, install/update, waking from idle,
 * settings changes and newly granted host permissions. A single failure keeps the previous
 * badge (e.g. network not ready after sleep); from the second consecutive failure the badge
 * shows a grey '!' with the error in its tooltip.
 */
import { ApiError, ChangeDetectionClient } from './api.js';
import { clearBadge, showErrorBadge, showUnreadBadge } from './badge.js';
import { writeWatchCache } from './cache.js';
import { createLogger } from './log.js';
import { notifyNewChanges } from './notify.js';
import { hasHostPermission, isConfigured, loadSettings } from './settings.js';
import { countUnread, normalizeWatchList } from './watches.js';

const log = createLogger('refresh');

export const FAILURE_COUNT_KEY = 'refreshFailureCount';
export const FAILURES_BEFORE_ERROR_BADGE = 2;

/**
 * Outcome of a refresh.
 *
 * @typedef {object} RefreshResult
 * @property {boolean} configured - False when the server URL or API key is missing; nothing was fetched.
 * @property {import('./watches.js').Watch[]} watches - Fetched watches ([] when not configured).
 * @property {number} fetchedAt - Completion time in milliseconds since the epoch.
 */

/**
 * Fetch every watch and update failure counter, cache, badge and notifications.
 *
 * @param {string} reason - What triggered the refresh, e.g. 'alarm' or 'popup'; used in logs only.
 * @returns {Promise<RefreshResult>} The fetched watches.
 * @throws {Error} When the server cannot be queried; the failure is recorded first.
 */
export async function refreshWatches(reason) {
  const settings = await loadSettings();
  if (!isConfigured(settings)) {
    await clearBadge();
    log.debug('Refresh skipped (%s): server URL or API key not set', reason);
    return { configured: false, watches: [], fetchedAt: Date.now() };
  }
  const started = Date.now();
  let watches;
  try {
    if (!(await hasHostPermission(settings.baseURL))) {
      throw new ApiError(`Access to ${settings.baseURL} is not granted`, { kind: 'permission' });
    }
    watches = normalizeWatchList(await new ChangeDetectionClient(settings).listWatches());
  } catch (error) {
    await recordFailure(reason, error);
    throw error;
  }
  const fetchedAt = Date.now();
  const unread = countUnread(watches);
  await chrome.storage.session.set({ [FAILURE_COUNT_KEY]: 0 });
  await writeWatchCache(watches, fetchedAt);
  await showUnreadBadge(unread);
  try {
    await notifyNewChanges(watches, settings.notificationsEnabled);
  } catch (error) {
    log.warn('Could not show notification: %s', error.message);
  }
  log.info('Refreshed watches (%s): %d watches, %d unread in %d ms', reason, watches.length, unread, fetchedAt - started);
  return { configured: true, watches, fetchedAt };
}

/**
 * Count one failed refresh and show the error badge from the second failure in a row.
 *
 * @param {string} reason - What triggered the refresh.
 * @param {Error} error - The failure.
 * @returns {Promise<void>} Resolves when the counter and badge are updated.
 */
async function recordFailure(reason, error) {
  const { [FAILURE_COUNT_KEY]: previous = 0 } = await chrome.storage.session.get(FAILURE_COUNT_KEY);
  const failures = previous + 1;
  await chrome.storage.session.set({ [FAILURE_COUNT_KEY]: failures });
  if (failures >= FAILURES_BEFORE_ERROR_BADGE) {
    await showErrorBadge(error.message);
    log.error('Refresh failed (%s), %d times in a row: %s', reason, failures, error.message);
  } else {
    log.warn('Refresh failed (%s), keeping previous badge: %s', reason, error.message);
  }
}
```
5. Light checks: `npm run lint` must exit 0, then `npx jest tests/lib/refresh.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
6. Commit: `git add src/lib/refresh.js && git commit -m "feat: add refresh cycle with failure counter and error badge"`

**Context for Implementor**
Storage keys: `chrome.storage.sync` — `baseURL` (normalized, no trailing slash), `apiKey`, `refreshInterval` (integer minutes 1–1440, default 5), `notificationsEnabled` (boolean, default false); `chrome.storage.session` — `watchCache` `{watches, fetchedAt}` and `refreshFailureCount` (number); `chrome.storage.local` — `notifiedUuids` (string[]).
- `ApiError` (`src/lib/api.js`, `class ApiError extends Error`): `message` is user-safe; `kind` is one of `auth` (HTTP 401/403), `not_found` (404), `http` (other non-2xx), `network`, `timeout` (15 s), `invalid_response` (non-JSON body), `permission` (host access not granted); `status` is the HTTP status or 0.
- `reason` values used later: `alarm`, `popup`, `startup`, `install`, `update`, `wake`, `settings`, `permission` — logged only.
- Test environment: `globalThis.chrome` is the in-memory fake from `tests/helpers/chrome-fake.js`, reset before every test (storage emptied, mocks fresh, event listeners kept); `fetch` is a fresh `jest.fn()` per test; `console.*` is silenced and recorded — `hasLog(level, pattern)` / `allLogText()` from `tests/helpers/logs.js` assert on it.

**Acceptance Criteria**
- [ ] `npx jest tests/lib/refresh.test.js` passes (7 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 145 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-20: Service-worker actions: open watch, mark all viewed
**Type:** Optimisation
**Priority:** High
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/lib/actions.test.js, src/lib/actions.js

**Current State**
Clicking a watch in the legacy popup opens the tab from the popup and then asks the worker to mark it viewed; the popup is destroyed as soon as a foreground tab opens, so the request can be lost. "Mark all as watched" loops sequentially from the popup: per watch GET + PUT + a full list refetch.

**Target State**
New `src/lib/actions.js` (first half) exporting `MARK_ALL_CONCURRENCY = 4` and:
- `openWatch({uuid, url, lastChanged = 0, background = false})` → `chrome.tabs.create({url, active: !background})`; if `lastChanged > 0`: `markViewed(uuid, lastChanged)`, update the cache and the badge from it (no refetch); INFO log.
- `markAllViewed(items)` → marks `[{uuid, lastChanged}]` with at most 4 requests in flight, updates cache + badge once, returns `{markedUuids, failed}`; per-item failures at DEBUG, one summary line (INFO, or WARN when something failed).
- private `syncBadgeAfterMarking(uuids)`.

Public surface after this task (exact names and parameters):
- `src/lib/actions.js`: `export const MARK_ALL_CONCURRENCY = 4`
- `src/lib/actions.js`: `export async function openWatch({ uuid, url, lastChanged = 0, background = false })`
- `src/lib/actions.js`: `export async function markAllViewed(items)`

Log lines this task adds (level and exact format string, arguments as in the code below):
- INFO `Opened watch %s (no changes to mark)`
- INFO `Opened watch %s and marked it viewed`
- DEBUG `Could not mark watch %s viewed: %s`
- WARN `Marked %d of %d watches viewed; %d failed`
- INFO `Marked %d watches viewed`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/lib/actions.test.js` › openWatch › opens a foreground tab, marks the watch viewed and updates badge from the cache
- `tests/lib/actions.test.js` › openWatch › background: true opens an inactive tab
- `tests/lib/actions.test.js` › openWatch › never-changed watch: opens the tab without any request
- `tests/lib/actions.test.js` › openWatch › a failed PUT rejects after the tab was opened
- `tests/lib/actions.test.js` › markAllViewed › marks every item with at most MARK_ALL_CONCURRENCY requests in flight
- `tests/lib/actions.test.js` › markAllViewed › reports failures, updates the cache for successes only and warns once
- `tests/lib/actions.test.js` › markAllViewed › an empty list makes no requests

**Implementation Steps**
1. Write the tests. Create `tests/lib/actions.test.js` with exactly this content:

```js
import { markAllViewed, MARK_ALL_CONCURRENCY, openWatch } from '../../src/lib/actions.js';
import { readWatchCache, writeWatchCache } from '../../src/lib/cache.js';
import { hasLog } from '../helpers/logs.js';

const BASE = 'http://192.168.1.10:5000';

/**
 * Fake fetch Response.
 *
 * @param {*} body - JSON body.
 * @param {number} status - HTTP status.
 * @returns {object} Response-like object.
 */
function jsonResponse(body, status = 200) {
  return { ok: status < 300, status, json: async () => body };
}

beforeEach(async () => {
  await chrome.storage.sync.set({ baseURL: BASE, apiKey: 'secret-key' });
});

describe('openWatch', () => {
  test('opens a foreground tab, marks the watch viewed and updates badge from the cache', async () => {
    await writeWatchCache([
      { uuid: 'a', last_changed: 100, viewed: false },
      { uuid: 'b', last_changed: 100, viewed: false },
    ], 1);
    globalThis.fetch.mockResolvedValue(jsonResponse('OK'));
    await openWatch({ uuid: 'a', url: `${BASE}/diff/a`, lastChanged: 100 });
    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: `${BASE}/diff/a`, active: true });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch.mock.calls[0][0]).toBe(`${BASE}/api/v1/watch/a`);
    expect(globalThis.fetch.mock.calls[0][1].method).toBe('PUT');
    expect((await readWatchCache()).watches[0].viewed).toBe(true);
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '1' });
    expect(hasLog('info', '[cdio:actions] Opened watch a and marked it viewed')).toBe(true);
  });

  test('background: true opens an inactive tab', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse('OK'));
    await openWatch({ uuid: 'a', url: 'https://x', lastChanged: 5, background: true });
    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: 'https://x', active: false });
  });

  test('never-changed watch: opens the tab without any request', async () => {
    await openWatch({ uuid: 'n', url: 'https://site', lastChanged: 0 });
    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: 'https://site', active: true });
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(hasLog('info', 'Opened watch n (no changes to mark)')).toBe(true);
  });

  test('a failed PUT rejects after the tab was opened', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse('no', 500));
    await expect(openWatch({ uuid: 'a', url: 'https://x', lastChanged: 5 })).rejects.toMatchObject({ kind: 'http' });
    expect(chrome.tabs.create).toHaveBeenCalled();
  });
});

describe('markAllViewed', () => {
  test('marks every item with at most MARK_ALL_CONCURRENCY requests in flight', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    globalThis.fetch.mockImplementation(async () => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 1));
      inFlight -= 1;
      return jsonResponse('OK');
    });
    const items = Array.from({ length: 10 }, (_, i) => ({ uuid: `u${i}`, lastChanged: 5 }));
    const result = await markAllViewed(items);
    expect(result).toEqual({ markedUuids: expect.arrayContaining(items.map((i) => i.uuid)), failed: 0 });
    expect(result.markedUuids).toHaveLength(10);
    expect(globalThis.fetch).toHaveBeenCalledTimes(10);
    expect(maxInFlight).toBe(MARK_ALL_CONCURRENCY);
    expect(hasLog('info', '[cdio:actions] Marked 10 watches viewed')).toBe(true);
  });

  test('reports failures, updates the cache for successes only and warns once', async () => {
    await writeWatchCache([
      { uuid: 'ok', last_changed: 5, viewed: false },
      { uuid: 'bad', last_changed: 5, viewed: false },
    ], 1);
    globalThis.fetch.mockImplementation(async (url) => (url.endsWith('/bad') ? jsonResponse('x', 500) : jsonResponse('OK')));
    const result = await markAllViewed([{ uuid: 'ok', lastChanged: 5 }, { uuid: 'bad', lastChanged: 5 }]);
    expect(result).toEqual({ markedUuids: ['ok'], failed: 1 });
    expect((await readWatchCache()).watches.map((w) => w.viewed)).toEqual([true, false]);
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '1' });
    expect(hasLog('warn', 'Marked 1 of 2 watches viewed; 1 failed')).toBe(true);
    expect(hasLog('debug', 'Could not mark watch bad viewed: Server error (HTTP 500)')).toBe(true);
  });

  test('an empty list makes no requests', async () => {
    expect(await markAllViewed([])).toEqual({ markedUuids: [], failed: 0 });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
```
2. Run `npx jest tests/lib/actions.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/lib/actions.test.js && git commit -m "test: add tests for open-watch and mark-all actions"`
4. Create `src/lib/actions.js` with exactly this content:

```js
/**
 * @file Service-worker operations requested by the popup and options pages.
 *
 * They run in the service worker so they finish even when the popup closes (it closes as
 * soon as a foreground tab opens).
 */
import { ChangeDetectionClient } from './api.js';
import { showUnreadBadge } from './badge.js';
import { markCachedViewed } from './cache.js';
import { createLogger } from './log.js';
import { loadSettings } from './settings.js';
import { countUnread } from './watches.js';

const log = createLogger('actions');

export const MARK_ALL_CONCURRENCY = 4;

/**
 * Mark watches viewed in the cache and update the badge from it (no refetch).
 *
 * @param {string[]} uuids - Watches just marked viewed.
 * @returns {Promise<void>} Resolves when done; does nothing without a cache.
 */
async function syncBadgeAfterMarking(uuids) {
  const watches = await markCachedViewed(uuids);
  if (watches) await showUnreadBadge(countUnread(watches));
}

/**
 * Open a watch in a new tab and, when it has changed, mark it viewed.
 *
 * @param {{uuid: string, url: string, lastChanged?: number, background?: boolean}} request - Watch UUID, URL to open, the watch's last_changed, and whether to open the tab in the background.
 * @returns {Promise<void>} Resolves when the tab is open and the watch is marked.
 */
export async function openWatch({ uuid, url, lastChanged = 0, background = false }) {
  await chrome.tabs.create({ url, active: !background });
  if (!(Number(lastChanged) > 0)) {
    log.info('Opened watch %s (no changes to mark)', uuid);
    return;
  }
  const client = new ChangeDetectionClient(await loadSettings());
  await client.markViewed(uuid, lastChanged);
  await syncBadgeAfterMarking([uuid]);
  log.info('Opened watch %s and marked it viewed', uuid);
}

/**
 * Mark several watches viewed, MARK_ALL_CONCURRENCY requests at a time.
 *
 * @param {{uuid: string, lastChanged: number}[]} items - Watches to mark.
 * @returns {Promise<{markedUuids: string[], failed: number}>} UUIDs marked successfully and the number of failures.
 */
export async function markAllViewed(items) {
  const client = new ChangeDetectionClient(await loadSettings());
  const queue = [...items];
  const markedUuids = [];
  let failed = 0;
  const worker = async () => {
    while (queue.length > 0) {
      const { uuid, lastChanged } = queue.shift();
      try {
        await client.markViewed(uuid, lastChanged);
        markedUuids.push(uuid);
      } catch (error) {
        failed += 1;
        log.debug('Could not mark watch %s viewed: %s', uuid, error.message);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(MARK_ALL_CONCURRENCY, items.length) }, worker));
  await syncBadgeAfterMarking(markedUuids);
  if (failed > 0) log.warn('Marked %d of %d watches viewed; %d failed', markedUuids.length, items.length, failed);
  else log.info('Marked %d watches viewed', markedUuids.length);
  return { markedUuids, failed };
}
```
5. Light checks: `npm run lint` must exit 0, then `npx jest tests/lib/actions.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
6. Commit: `git add src/lib/actions.js && git commit -m "perf: open and mark watches from the service worker with bounded concurrency"`

**Context for Implementor**
Message contract (`src/lib/messages.js` `ACTIONS`; the popup/options pages send, the service worker answers `{success: true, data?}` or `{success: false, error, errorKind?}`):
- `getWatches` `{}` → data `{watches: Watch[], fetchedAt: number}` (runs a full refresh).
- `openWatch` `{uuid, url, lastChanged, background}` → no data (opens the tab; marks viewed when `lastChanged > 0`).
- `markAllViewed` `{items: [{uuid, lastChanged}]}` → data `{markedUuids: string[], failed: number}`.
- `testConnection` `{baseURL, apiKey}` → data `{version: string, watchCount: number}` (nothing is saved).
- `addWatch` `{url}` → data `{uuid: string}`.
- `recheckAll` `{}` → data `{message: string}`.
- Runs in the service worker so it completes after the popup closes. `chrome.tabs.create` needs no permission.
- The next task appends three more actions and adds `validateConnection` to the settings import — keep the import line exactly as given here.

**Acceptance Criteria**
- [ ] `npx jest tests/lib/actions.test.js` passes (7 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 152 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-21: Service-worker actions: test connection, add watch, recheck all
**Type:** Bug Fix
**Priority:** High
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/lib/actions.test.js, src/lib/actions.js

**Current State**
The legacy options page's "Test Connection" first **saves** the typed URL and key to `chrome.storage.sync` and then tests the saved values: a failed test overwrites the working key. The test fetches the full watch list instead of a cheap endpoint and reports nothing about the server. There are no actions for adding a watch or rechecking.

**Target State**
`src/lib/actions.js` (second half, appended; settings import becomes `import { loadSettings, validateConnection } from './settings.js';`):
- `testConnection({baseURL, apiKey})` → validates with `validateConnection` (throws `Error(check.error)`), queries `systemInfo()` with the **unsaved** values, returns `{version: String(info.version ?? 'unknown'), watchCount: Number(info.watch_count) || 0}`; INFO on success, WARN on failure; saves nothing.
- `addWatch({url})` → `createWatch(url)` with saved settings → `{uuid}`.
- `recheckAll()` → `{message: String(result.status ?? 'Recheck queued')}`.

Public surface after this task (exact names and parameters):
- `src/lib/actions.js`: `export async function testConnection({ baseURL, apiKey })`
- `src/lib/actions.js`: `export async function addWatch({ url })`
- `src/lib/actions.js`: `export async function recheckAll()`

Log lines this task adds (level and exact format string, arguments as in the code below):
- INFO `Connection test passed: %s runs version %s with %d watches`
- WARN `Connection test failed for %s: %s`
- INFO `Added watch for %s: uuid=%s`
- INFO `Requested recheck of all watches: %s`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/lib/actions.test.js` › testConnection › queries systeminfo with the unsaved values and does not store them
- `tests/lib/actions.test.js` › testConnection › invalid values reject without a request
- `tests/lib/actions.test.js` › testConnection › server errors reject and warn
- `tests/lib/actions.test.js` › testConnection › missing fields fall back to unknown / 0
- `tests/lib/actions.test.js` › addWatch › POSTs the url and returns the uuid
- `tests/lib/actions.test.js` › addWatch › returns an empty uuid when the server omits it
- `tests/lib/actions.test.js` › recheckAll › returns the server status message
- `tests/lib/actions.test.js` › recheckAll › falls back to a generic message

**Implementation Steps**
1. Write the tests. In `tests/lib/actions.test.js`, replace this exact text (it occurs exactly once):

```js
import { markAllViewed, MARK_ALL_CONCURRENCY, openWatch } from '../../src/lib/actions.js';
import { readWatchCache, writeWatchCache } from '../../src/lib/cache.js';
import { hasLog } from '../helpers/logs.js';
```

with:

```js
import { addWatch, markAllViewed, MARK_ALL_CONCURRENCY, openWatch, recheckAll, testConnection } from '../../src/lib/actions.js';
import { readWatchCache, writeWatchCache } from '../../src/lib/cache.js';
import { allLogText, hasLog } from '../helpers/logs.js';
```
2. Append the following to the end of `tests/lib/actions.test.js` (keep everything already in the file):

```js
describe('testConnection', () => {
  test('queries systeminfo with the unsaved values and does not store them', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse({ version: '0.50.12', watch_count: 7 }));
    const result = await testConnection({ baseURL: 'http://other:5000/', apiKey: ' new-key ' });
    expect(result).toEqual({ version: '0.50.12', watchCount: 7 });
    expect(globalThis.fetch.mock.calls[0][0]).toBe('http://other:5000/api/v1/systeminfo');
    expect(globalThis.fetch.mock.calls[0][1].headers['x-api-key']).toBe('new-key');
    expect(await chrome.storage.sync.get(null)).toEqual({ baseURL: BASE, apiKey: 'secret-key' });
    expect(hasLog('info', 'Connection test passed: http://other:5000 runs version 0.50.12 with 7 watches')).toBe(true);
    expect(allLogText()).not.toContain('new-key');
  });

  test('invalid values reject without a request', async () => {
    await expect(testConnection({ baseURL: 'nope', apiKey: 'k' })).rejects.toThrow(
      'Enter a valid http:// or https:// URL, e.g. http://192.168.1.10:5000',
    );
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test('server errors reject and warn', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse('x', 403));
    await expect(testConnection({ baseURL: BASE, apiKey: 'bad' })).rejects.toMatchObject({ kind: 'auth' });
    expect(hasLog('warn', `Connection test failed for ${BASE}: API key rejected (HTTP 403)`)).toBe(true);
  });

  test('missing fields fall back to unknown / 0', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse({}));
    expect(await testConnection({ baseURL: BASE, apiKey: 'k' })).toEqual({ version: 'unknown', watchCount: 0 });
  });
});

describe('addWatch', () => {
  test('POSTs the url and returns the uuid', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse({ uuid: 'new-1' }, 201));
    expect(await addWatch({ url: 'https://example.com/p' })).toEqual({ uuid: 'new-1' });
    expect(JSON.parse(globalThis.fetch.mock.calls[0][1].body)).toEqual({ url: 'https://example.com/p' });
    expect(hasLog('info', 'Added watch for https://example.com/p: uuid=new-1')).toBe(true);
  });

  test('returns an empty uuid when the server omits it', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse(null, 201));
    expect(await addWatch({ url: 'https://example.com/p' })).toEqual({ uuid: '' });
  });
});

describe('recheckAll', () => {
  test('returns the server status message', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse({ status: 'OK, queued 4 watches for rechecking' }));
    expect(await recheckAll()).toEqual({ message: 'OK, queued 4 watches for rechecking' });
    expect(hasLog('info', 'Requested recheck of all watches: OK, queued 4 watches for rechecking')).toBe(true);
  });

  test('falls back to a generic message', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse({}));
    expect(await recheckAll()).toEqual({ message: 'Recheck queued' });
  });
});
```
3. Run `npx jest tests/lib/actions.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
4. Commit only the test files: `git add tests/lib/actions.test.js && git commit -m "test: add tests for connection test, add-watch and recheck actions"`
5. In `src/lib/actions.js`, replace this exact text (it occurs exactly once):

```js
import { loadSettings } from './settings.js';
```

with:

```js
import { loadSettings, validateConnection } from './settings.js';
```
6. Append the following to the end of `src/lib/actions.js` (keep everything already in the file):

```js
/**
 * Check a server URL and API key without saving them.
 *
 * @param {{baseURL: string, apiKey: string}} credentials - Unsaved form values.
 * @returns {Promise<{version: string, watchCount: number}>} Server version and number of watches.
 * @throws {Error} When the values are invalid or the server cannot be queried.
 */
export async function testConnection({ baseURL, apiKey }) {
  const check = validateConnection({ baseURL, apiKey });
  if (!check.ok) throw new Error(check.error);
  try {
    const info = await new ChangeDetectionClient(check.value).systemInfo();
    const result = { version: String(info?.version ?? 'unknown'), watchCount: Number(info?.watch_count) || 0 };
    log.info('Connection test passed: %s runs version %s with %d watches', check.value.baseURL, result.version, result.watchCount);
    return result;
  } catch (error) {
    log.warn('Connection test failed for %s: %s', check.value.baseURL, error.message);
    throw error;
  }
}

/**
 * Create a watch for a page.
 *
 * @param {{url: string}} request - Page URL to monitor.
 * @returns {Promise<{uuid: string}>} UUID of the new watch.
 */
export async function addWatch({ url }) {
  const result = await new ChangeDetectionClient(await loadSettings()).createWatch(url);
  const uuid = String(result?.uuid ?? '');
  log.info('Added watch for %s: uuid=%s', url, uuid);
  return { uuid };
}

/**
 * Ask the server to recheck every watch.
 *
 * @returns {Promise<{message: string}>} Server status message.
 */
export async function recheckAll() {
  const result = await new ChangeDetectionClient(await loadSettings()).recheckAll();
  const message = String(result?.status ?? 'Recheck queued');
  log.info('Requested recheck of all watches: %s', message);
  return { message };
}
```
7. Light checks: `npm run lint` must exit 0, then `npx jest tests/lib/actions.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
8. Commit: `git add src/lib/actions.js && git commit -m "fix: test connection without saving and add watch/recheck actions"`

**Context for Implementor**
Message contract (`src/lib/messages.js` `ACTIONS`; the popup/options pages send, the service worker answers `{success: true, data?}` or `{success: false, error, errorKind?}`):
- `getWatches` `{}` → data `{watches: Watch[], fetchedAt: number}` (runs a full refresh).
- `openWatch` `{uuid, url, lastChanged, background}` → no data (opens the tab; marks viewed when `lastChanged > 0`).
- `markAllViewed` `{items: [{uuid, lastChanged}]}` → data `{markedUuids: string[], failed: number}`.
- `testConnection` `{baseURL, apiKey}` → data `{version: string, watchCount: number}` (nothing is saved).
- `addWatch` `{url}` → data `{uuid: string}`.
- `recheckAll` `{}` → data `{message: string}`.
- Logging: only through `createLogger(scope)` from `src/lib/log.js` (ESLint `no-console` rejects `console.*` elsewhere). Lines start `[cdio:<scope>]`, use `%s`/`%d` placeholders, never include the API key. The test asserts the new API key never appears in any log line.

**Acceptance Criteria**
- [ ] `npx jest tests/lib/actions.test.js` passes (15 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 160 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-22: Service worker rewrite part 1: message router
**Type:** Refactor
**Priority:** High
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/background.test.js, src/background.js, eslint.config.mjs

**Current State**
Legacy `src/background.js` (classic script, ~330 lines) mixes an API client, duplicated normalisation, badge logic, a message switch with duplicate actions (`markAsRead`/`updateWatchViewed`), alarms and listeners. Everything it does now exists as tested modules in `src/lib/`.

**Target State**
`src/background.js` is replaced by a module that imports from `src/lib/` and contains private `runAction(request)` (switch over `ACTIONS`; unknown → `Error('Unknown action: <action>')`) and exported `handleMessage(request)` (never throws; `{success: true}` when the action returns nothing, `{success: true, data}` otherwise, `{success: false, error, errorKind}` + WARN log on failure), plus the top-level `chrome.runtime.onMessage` listener (`handleMessage(request).then(sendResponse); return true;`). `src/background.js` is removed from `LEGACY_FILES` in `eslint.config.mjs`. Alarms and lifecycle listeners are re-added by the next task (the extension is not released between the two tasks).

Public surface after this task (exact names and parameters):
- `src/background.js`: `export async function handleMessage(request)`

Log lines this task adds (level and exact format string, arguments as in the code below):
- WARN `Message %s failed: %s`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/background.test.js` › message listener › is registered at import time and answers asynchronously through sendResponse
- `tests/background.test.js` › handleMessage › getWatches refreshes and returns watches with fetchedAt
- `tests/background.test.js` › handleMessage › failures return the message and errorKind and log a warning
- `tests/background.test.js` › handleMessage › openWatch with no changes returns success without data
- `tests/background.test.js` › handleMessage › markAllViewed defaults items to []
- `tests/background.test.js` › handleMessage › testConnection, addWatch and recheckAll are routed
- `tests/background.test.js` › handleMessage › a missing request is an unknown action

**Implementation Steps**
1. Write the tests. Create `tests/background.test.js` with exactly this content:

```js
import { handleMessage } from '../src/background.js';
import { flushPromises } from './helpers/dom.js';
import { hasLog } from './helpers/logs.js';

const BASE = 'http://192.168.1.10:5000';

/**
 * Make the global fetch answer with a JSON body.
 *
 * @param {*} body - JSON body.
 * @param {number} status - HTTP status.
 */
function respond(body, status = 200) {
  globalThis.fetch.mockResolvedValue({ ok: status < 300, status, json: async () => body });
}

/**
 * Store a complete configuration.
 *
 * @returns {Promise<void>} Done.
 */
function configure() {
  return chrome.storage.sync.set({ baseURL: BASE, apiKey: 'key', refreshInterval: 5 });
}

describe('message listener', () => {
  test('is registered at import time and answers asynchronously through sendResponse', async () => {
    expect(chrome.runtime.onMessage.hasListeners()).toBe(true);
    const sendResponse = jest.fn();
    const [keepOpen] = chrome.runtime.onMessage.dispatch({ action: 'nope' }, {}, sendResponse);
    expect(keepOpen).toBe(true);
    await flushPromises();
    expect(sendResponse).toHaveBeenCalledWith({ success: false, error: 'Unknown action: nope' });
  });
});

describe('handleMessage', () => {
  test('getWatches refreshes and returns watches with fetchedAt', async () => {
    await configure();
    respond({ a: { url: 'https://a', last_changed: 1, viewed: false } });
    const response = await handleMessage({ action: 'getWatches' });
    expect(response.success).toBe(true);
    expect(response.data.watches).toEqual([{ uuid: 'a', url: 'https://a', last_changed: 1, viewed: false }]);
    expect(typeof response.data.fetchedAt).toBe('number');
  });

  test('failures return the message and errorKind and log a warning', async () => {
    await configure();
    respond('x', 403);
    expect(await handleMessage({ action: 'getWatches' })).toEqual({
      success: false,
      error: 'API key rejected (HTTP 403)',
      errorKind: 'auth',
    });
    expect(hasLog('warn', '[cdio:background] Message getWatches failed: API key rejected (HTTP 403)')).toBe(true);
  });

  test('openWatch with no changes returns success without data', async () => {
    expect(await handleMessage({ action: 'openWatch', uuid: 'a', url: 'https://a', lastChanged: 0 })).toEqual({ success: true });
    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: 'https://a', active: true });
  });

  test('markAllViewed defaults items to []', async () => {
    await configure();
    expect(await handleMessage({ action: 'markAllViewed' })).toEqual({ success: true, data: { markedUuids: [], failed: 0 } });
  });

  test('testConnection, addWatch and recheckAll are routed', async () => {
    await configure();
    respond({ version: '1', watch_count: 2, uuid: 'n', status: 'OK' });
    expect((await handleMessage({ action: 'testConnection', baseURL: BASE, apiKey: 'k' })).data).toEqual({ version: '1', watchCount: 2 });
    expect((await handleMessage({ action: 'addWatch', url: 'https://x' })).data).toEqual({ uuid: 'n' });
    expect((await handleMessage({ action: 'recheckAll' })).data).toEqual({ message: 'OK' });
  });

  test('a missing request is an unknown action', async () => {
    expect(await handleMessage(undefined)).toEqual({ success: false, error: 'Unknown action: undefined' });
  });
});
```
2. Run `npx jest tests/background.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/background.test.js && git commit -m "test: add service worker message router tests"`
4. Replace the entire content of `src/background.js` with exactly:

```js
/**
 * @file Service worker entry point.
 *
 * Routes messages from the popup and options pages to lib/actions.js and lib/refresh.js.
 * All listeners are registered synchronously at top level, as Manifest V3 requires.
 */
import { addWatch, markAllViewed, openWatch, recheckAll, testConnection } from './lib/actions.js';
import { createLogger } from './lib/log.js';
import { ACTIONS } from './lib/messages.js';
import { refreshWatches } from './lib/refresh.js';

const log = createLogger('background');

/**
 * Run the operation named by a message.
 *
 * @param {{action: string}} request - Message from a page; see lib/messages.js.
 * @returns {Promise<*>} The operation result, undefined when it has none.
 * @throws {Error} For unknown actions and failed operations.
 */
async function runAction(request) {
  switch (request.action) {
    case ACTIONS.GET_WATCHES: {
      const { watches, fetchedAt } = await refreshWatches('popup');
      return { watches, fetchedAt };
    }
    case ACTIONS.OPEN_WATCH:
      return openWatch(request);
    case ACTIONS.MARK_ALL_VIEWED:
      return markAllViewed(request.items ?? []);
    case ACTIONS.TEST_CONNECTION:
      return testConnection(request);
    case ACTIONS.ADD_WATCH:
      return addWatch(request);
    case ACTIONS.RECHECK_ALL:
      return recheckAll();
    default:
      throw new Error(`Unknown action: ${request.action}`);
  }
}

/**
 * Handle one message and wrap the result in the response envelope; never throws.
 *
 * @param {{action: string}} request - Message from a page.
 * @returns {Promise<import('./lib/messages.js').MessageResponse>} `{success: true, data?}` or `{success: false, error, errorKind?}`.
 */
export async function handleMessage(request) {
  try {
    const data = await runAction(request ?? {});
    return data === undefined ? { success: true } : { success: true, data };
  } catch (error) {
    log.warn('Message %s failed: %s', String(request?.action), error.message);
    return { success: false, error: error.message, errorKind: error.kind };
  }
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  handleMessage(request).then(sendResponse);
  return true;
});
```
5. In `eslint.config.mjs`, replace this exact text (it occurs exactly once):

```js
const LEGACY_FILES = ['src/background.js', 'src/popup/popup.js', 'src/options/options.js'];
```

with:

```js
const LEGACY_FILES = ['src/popup/popup.js', 'src/options/options.js'];
```
6. Light checks: `npm run lint` must exit 0, then `npx jest tests/background.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
7. Commit: `git add src/background.js eslint.config.mjs && git commit -m "refactor: rewrite service worker message routing on lib modules"`

**Context for Implementor**
Message contract (`src/lib/messages.js` `ACTIONS`; the popup/options pages send, the service worker answers `{success: true, data?}` or `{success: false, error, errorKind?}`):
- `getWatches` `{}` → data `{watches: Watch[], fetchedAt: number}` (runs a full refresh).
- `openWatch` `{uuid, url, lastChanged, background}` → no data (opens the tab; marks viewed when `lastChanged > 0`).
- `markAllViewed` `{items: [{uuid, lastChanged}]}` → data `{markedUuids: string[], failed: number}`.
- `testConnection` `{baseURL, apiKey}` → data `{version: string, watchCount: number}` (nothing is saved).
- `addWatch` `{url}` → data `{uuid: string}`.
- `recheckAll` `{}` → data `{message: string}`.
- `GET_WATCHES` returns only `{watches, fetchedAt}` from `refreshWatches('popup')`.
- The legacy popup and options still send old action names until they are rewritten; they will get `Unknown action` meanwhile (not released).
- Test environment: `globalThis.chrome` is the in-memory fake from `tests/helpers/chrome-fake.js`, reset before every test (storage emptied, mocks fresh, event listeners kept); `fetch` is a fresh `jest.fn()` per test; `console.*` is silenced and recorded — `hasLog(level, pattern)` / `allLogText()` from `tests/helpers/logs.js` assert on it.

**Acceptance Criteria**
- [ ] `npx jest tests/background.test.js` passes (7 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 167 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-23: Service worker rewrite part 2: lifecycle, alarms, notifications
**Type:** Bug Fix
**Priority:** High
**Effort:** Medium (1–2 h)
**Tier:** Haiku
**Files:** tests/background.test.js, src/background.js

**Current State**
After the previous task, `src/background.js` only routes messages: nothing schedules the refresh alarm, reacts to install/startup/wake/settings changes, or handles notification clicks. The legacy version also never onboarded new users (the popup just says "configure").

**Target State**
`src/background.js` gains the final file overview, the full import block, and these functions (inserted before the `onMessage` registration): private `refreshQuietly(reason)`; exported `scheduleRefresh()`, `onInstalled({reason})` (INFO `Extension %s: version %s`, `clearLegacyAlarms`, schedule, open the options page when `reason === 'install'`, refresh), `onStartup()`, `onAlarm(alarm)` (only `REFRESH_ALARM`), `onIdleStateChanged(state)` (only `'active'` → refresh `wake`), `onStorageChanged(changes, areaName)` (`sync` only: `refreshInterval` → reschedule; `baseURL`/`apiKey` → clear cache + refresh `settings`), `onNotificationClicked(notificationId)`, private `registerNotificationListener()`, `onPermissionsAdded(permissions)`; then (appended at the end) the top-level listener registrations and `initialize()` + `export const ready = initialize();`.

Public surface after this task (exact names and parameters):
- `src/background.js`: `export async function scheduleRefresh()`
- `src/background.js`: `export async function onInstalled({ reason })`
- `src/background.js`: `export async function onStartup()`
- `src/background.js`: `export async function onAlarm(alarm)`
- `src/background.js`: `export async function onIdleStateChanged(state)`
- `src/background.js`: `export async function onStorageChanged(changes, areaName)`
- `src/background.js`: `export async function onNotificationClicked(notificationId)`
- `src/background.js`: `export async function onPermissionsAdded(permissions)`
- `src/background.js`: `export async function initialize()`
- `src/background.js`: `export const ready = initialize()`

Log lines this task adds (level and exact format string, arguments as in the code below):
- INFO `Extension %s: version %s`
- INFO `Opened notification %s`
- ERROR `Could not schedule refresh: %s`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/background.test.js` › start-up › registers every lifecycle listener and schedules the refresh alarm
- `tests/background.test.js` › start-up › initialize schedules the alarm from the saved interval
- `tests/background.test.js` › start-up › initialize logs instead of throwing when scheduling fails
- `tests/background.test.js` › lifecycle handlers › onInstalled(install) clears legacy alarms, schedules, opens options and refreshes
- `tests/background.test.js` › lifecycle handlers › onInstalled(update) does not open options and swallows refresh errors
- `tests/background.test.js` › lifecycle handlers › onStartup schedules and refreshes
- `tests/background.test.js` › lifecycle handlers › onAlarm refreshes only for the refresh alarm
- `tests/background.test.js` › lifecycle handlers › onIdleStateChanged refreshes only when active
- `tests/background.test.js` › lifecycle handlers › onStorageChanged reschedules on interval change
- `tests/background.test.js` › lifecycle handlers › onStorageChanged clears the cache and refreshes on server change
- `tests/background.test.js` › lifecycle handlers › onStorageChanged ignores other areas
- `tests/background.test.js` › lifecycle handlers › onPermissionsAdded refreshes when origins were granted
- `tests/background.test.js` › lifecycle handlers › onPermissionsAdded with only notifications does not refresh
- `tests/background.test.js` › onNotificationClicked › opens the diff page for a single-watch notification and clears it
- `tests/background.test.js` › onNotificationClicked › does nothing when not configured

**Implementation Steps**
1. Write the tests. In `tests/background.test.js`, replace this exact text (it occurs exactly once):

```js
import { handleMessage } from '../src/background.js';
```

with:

```js
import {
  handleMessage,
  initialize,
  onAlarm,
  onIdleStateChanged,
  onInstalled,
  onNotificationClicked,
  onPermissionsAdded,
  onStartup,
  onStorageChanged,
  ready,
} from '../src/background.js';
import { CACHE_KEY, writeWatchCache } from '../src/lib/cache.js';
import { REFRESH_ALARM } from '../src/lib/scheduler.js';
```
2. Append the following to the end of `tests/background.test.js` (keep everything already in the file):

```js
describe('start-up', () => {
  test('registers every lifecycle listener and schedules the refresh alarm', async () => {
    await ready;
    expect(chrome.runtime.onInstalled.hasListener(onInstalled)).toBe(true);
    expect(chrome.runtime.onStartup.hasListener(onStartup)).toBe(true);
    expect(chrome.alarms.onAlarm.hasListener(onAlarm)).toBe(true);
    expect(chrome.idle.onStateChanged.hasListener(onIdleStateChanged)).toBe(true);
    expect(chrome.storage.onChanged.hasListener(onStorageChanged)).toBe(true);
    expect(chrome.permissions.onAdded.hasListener(onPermissionsAdded)).toBe(true);
    expect(chrome.notifications.onClicked.hasListener(onNotificationClicked)).toBe(true);
  });

  test('initialize schedules the alarm from the saved interval', async () => {
    await chrome.storage.sync.set({ refreshInterval: 20 });
    await initialize();
    expect(await chrome.alarms.get(REFRESH_ALARM)).toMatchObject({ periodInMinutes: 20 });
  });

  test('initialize logs instead of throwing when scheduling fails', async () => {
    chrome.alarms.get.mockRejectedValueOnce(new Error('alarms unavailable'));
    await initialize();
    expect(hasLog('error', '[cdio:background] Could not schedule refresh: alarms unavailable')).toBe(true);
  });
});

describe('lifecycle handlers', () => {
  test('onInstalled(install) clears legacy alarms, schedules, opens options and refreshes', async () => {
    await onInstalled({ reason: 'install' });
    expect(chrome.alarms.clear).toHaveBeenCalledWith('updateBadge');
    expect(chrome.alarms.clear).toHaveBeenCalledWith('alarmWatchdog');
    expect(await chrome.alarms.get(REFRESH_ALARM)).toMatchObject({ periodInMinutes: 5 });
    expect(chrome.runtime.openOptionsPage).toHaveBeenCalled();
    expect(hasLog('info', '[cdio:background] Extension install: version 0.0.0-test')).toBe(true);
  });

  test('onInstalled(update) does not open options and swallows refresh errors', async () => {
    await configure();
    respond('x', 500);
    await onInstalled({ reason: 'update' });
    expect(chrome.runtime.openOptionsPage).not.toHaveBeenCalled();
    expect(hasLog('warn', 'Refresh failed (update)')).toBe(true);
  });

  test('onStartup schedules and refreshes', async () => {
    await configure();
    respond({});
    await onStartup();
    expect(await chrome.alarms.get(REFRESH_ALARM)).toMatchObject({ periodInMinutes: 5 });
    expect(hasLog('info', 'Refreshed watches (startup)')).toBe(true);
  });

  test('onAlarm refreshes only for the refresh alarm', async () => {
    await configure();
    respond({});
    await onAlarm({ name: 'other' });
    expect(globalThis.fetch).not.toHaveBeenCalled();
    await onAlarm({ name: REFRESH_ALARM });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  test('onIdleStateChanged refreshes only when active', async () => {
    await configure();
    respond({});
    await onIdleStateChanged('idle');
    expect(globalThis.fetch).not.toHaveBeenCalled();
    await onIdleStateChanged('active');
    expect(hasLog('info', 'Refreshed watches (wake)')).toBe(true);
  });

  test('onStorageChanged reschedules on interval change', async () => {
    await chrome.storage.sync.set({ refreshInterval: 30 });
    await onStorageChanged({ refreshInterval: { newValue: 30 } }, 'sync');
    expect(await chrome.alarms.get(REFRESH_ALARM)).toMatchObject({ periodInMinutes: 30 });
  });

  test('onStorageChanged clears the cache and refreshes on server change', async () => {
    await configure();
    await writeWatchCache([{ uuid: 'old' }], 1);
    respond({});
    await onStorageChanged({ baseURL: { newValue: BASE } }, 'sync');
    expect(chrome.storage.session.remove).toHaveBeenCalledWith(CACHE_KEY);
    expect(hasLog('info', 'Refreshed watches (settings)')).toBe(true);
  });

  test('onStorageChanged ignores other areas', async () => {
    await onStorageChanged({ baseURL: { newValue: BASE } }, 'local');
    expect(chrome.storage.session.remove).not.toHaveBeenCalled();
  });

  test('onPermissionsAdded refreshes when origins were granted', async () => {
    await configure();
    respond({});
    await onPermissionsAdded({ permissions: [], origins: ['http://192.168.1.10/*'] });
    expect(hasLog('info', 'Refreshed watches (permission)')).toBe(true);
  });

  test('onPermissionsAdded with only notifications does not refresh', async () => {
    await onPermissionsAdded({ permissions: ['notifications'], origins: [] });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe('onNotificationClicked', () => {
  test('opens the diff page for a single-watch notification and clears it', async () => {
    await configure();
    await onNotificationClicked('cdio-watch:abc');
    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: `${BASE}/diff/abc` });
    expect(chrome.notifications.clear).toHaveBeenCalledWith('cdio-watch:abc');
    expect(hasLog('info', 'Opened notification cdio-watch:abc')).toBe(true);
  });

  test('does nothing when not configured', async () => {
    await onNotificationClicked('cdio-changes');
    expect(chrome.tabs.create).not.toHaveBeenCalled();
  });
});
```
3. Run `npx jest tests/background.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
4. Commit only the test files: `git add tests/background.test.js && git commit -m "test: add service worker lifecycle and notification tests"`
5. In `src/background.js`, replace this exact text (it occurs exactly once):

```js
/**
 * @file Service worker entry point.
 *
 * Routes messages from the popup and options pages to lib/actions.js and lib/refresh.js.
 * All listeners are registered synchronously at top level, as Manifest V3 requires.
 */
```

with:

```js
/**
 * @file Service worker entry point.
 *
 * Routes messages from the popup and options pages to lib/actions.js and lib/refresh.js,
 * keeps the refresh alarm scheduled, and refreshes on startup, install/update, wake from
 * idle, settings changes and newly granted permissions. All listeners are registered
 * synchronously at top level, as Manifest V3 requires.
 */
```
6. In `src/background.js`, replace this exact text (it occurs exactly once):

```js
import { addWatch, markAllViewed, openWatch, recheckAll, testConnection } from './lib/actions.js';
import { createLogger } from './lib/log.js';
import { ACTIONS } from './lib/messages.js';
import { refreshWatches } from './lib/refresh.js';
```

with:

```js
import { addWatch, markAllViewed, openWatch, recheckAll, testConnection } from './lib/actions.js';
import { clearWatchCache } from './lib/cache.js';
import { createLogger } from './lib/log.js';
import { ACTIONS } from './lib/messages.js';
import { notificationTarget } from './lib/notify.js';
import { refreshWatches } from './lib/refresh.js';
import { REFRESH_ALARM, clearLegacyAlarms, ensureRefreshAlarm } from './lib/scheduler.js';
import { loadSettings } from './lib/settings.js';
```
7. In `src/background.js`, insert the following immediately before the line `chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {`:

```js
/**
 * Refresh and ignore failures (refreshWatches already logged and counted them).
 *
 * @param {string} reason - What triggered the refresh.
 * @returns {Promise<void>} Resolves when the refresh finished or failed.
 */
async function refreshQuietly(reason) {
  try {
    await refreshWatches(reason);
  } catch {
    // Already recorded by refreshWatches.
  }
}

/**
 * Make sure the refresh alarm matches the saved interval.
 *
 * @returns {Promise<void>} Resolves when the alarm is scheduled.
 */
export async function scheduleRefresh() {
  const { refreshInterval } = await loadSettings();
  await ensureRefreshAlarm(refreshInterval);
}

/**
 * chrome.runtime.onInstalled handler: clean up, schedule, onboard, refresh.
 *
 * @param {{reason: string}} details - Install details; reason is 'install', 'update', …
 * @returns {Promise<void>} Resolves when done.
 */
export async function onInstalled({ reason }) {
  log.info('Extension %s: version %s', reason, chrome.runtime.getManifest().version);
  await clearLegacyAlarms();
  await scheduleRefresh();
  if (reason === 'install') await chrome.runtime.openOptionsPage();
  await refreshQuietly(reason);
}

/**
 * chrome.runtime.onStartup handler.
 *
 * @returns {Promise<void>} Resolves when done.
 */
export async function onStartup() {
  await scheduleRefresh();
  await refreshQuietly('startup');
}

/**
 * chrome.alarms.onAlarm handler.
 *
 * @param {{name: string}} alarm - The alarm that fired.
 * @returns {Promise<void>} Resolves when done.
 */
export async function onAlarm(alarm) {
  if (alarm.name === REFRESH_ALARM) await refreshQuietly('alarm');
}

/**
 * chrome.idle.onStateChanged handler: refresh when the user comes back.
 *
 * @param {string} state - 'active', 'idle' or 'locked'.
 * @returns {Promise<void>} Resolves when done.
 */
export async function onIdleStateChanged(state) {
  if (state === 'active') await refreshQuietly('wake');
}

/**
 * chrome.storage.onChanged handler: reschedule and refresh after settings change.
 *
 * @param {object} changes - Changed keys.
 * @param {string} areaName - 'sync', 'local' or 'session'.
 * @returns {Promise<void>} Resolves when done.
 */
export async function onStorageChanged(changes, areaName) {
  if (areaName !== 'sync') return;
  if (changes.refreshInterval) await scheduleRefresh();
  if (changes.baseURL || changes.apiKey) {
    await clearWatchCache();
    await refreshQuietly('settings');
  }
}

/**
 * chrome.notifications.onClicked handler: open the matching page and close the notification.
 *
 * @param {string} notificationId - ID of the clicked notification.
 * @returns {Promise<void>} Resolves when done.
 */
export async function onNotificationClicked(notificationId) {
  const { baseURL } = await loadSettings();
  if (!baseURL) return;
  await chrome.tabs.create({ url: notificationTarget(notificationId, baseURL) });
  await chrome.notifications.clear(notificationId);
  log.info('Opened notification %s', notificationId);
}

/**
 * Register the notification click handler once chrome.notifications exists
 * (the API appears only after the optional permission is granted).
 */
function registerNotificationListener() {
  if (chrome.notifications && !chrome.notifications.onClicked.hasListener(onNotificationClicked)) {
    chrome.notifications.onClicked.addListener(onNotificationClicked);
  }
}

/**
 * chrome.permissions.onAdded handler.
 *
 * @param {{permissions?: string[], origins?: string[]}} permissions - Newly granted permissions.
 * @returns {Promise<void>} Resolves when done.
 */
export async function onPermissionsAdded(permissions) {
  if (permissions.permissions?.includes('notifications')) registerNotificationListener();
  if (permissions.origins?.length) await refreshQuietly('permission');
}

```
8. Append the following to the end of `src/background.js` (keep everything already in the file):

```js
chrome.runtime.onInstalled.addListener(onInstalled);
chrome.runtime.onStartup.addListener(onStartup);
chrome.alarms.onAlarm.addListener(onAlarm);
chrome.idle.onStateChanged.addListener(onIdleStateChanged);
chrome.storage.onChanged.addListener(onStorageChanged);
chrome.permissions.onAdded.addListener(onPermissionsAdded);
registerNotificationListener();

/**
 * Service-worker start-up: make sure the refresh alarm exists (Chrome may have dropped it).
 *
 * @returns {Promise<void>} Resolves when done; failures are logged, never thrown.
 */
export async function initialize() {
  try {
    await scheduleRefresh();
  } catch (error) {
    log.error('Could not schedule refresh: %s', error.message);
  }
}

export const ready = initialize();
```
9. Light checks: `npm run lint` must exit 0, then `npx jest tests/background.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
10. Commit: `git add src/background.js && git commit -m "fix: schedule refresh at every start-up and handle lifecycle events"`

**Context for Implementor**
Storage keys: `chrome.storage.sync` — `baseURL` (normalized, no trailing slash), `apiKey`, `refreshInterval` (integer minutes 1–1440, default 5), `notificationsEnabled` (boolean, default false); `chrome.storage.session` — `watchCache` `{watches, fetchedAt}` and `refreshFailureCount` (number); `chrome.storage.local` — `notifiedUuids` (string[]).
- MV3 requires every listener to be registered synchronously at top level — the appended block does that.
- `chrome.notifications` only exists after the optional permission is granted, so the click listener is registered at start-up if available and again from `onPermissionsAdded`.
- Newly granted origins trigger a refresh so a "!" badge clears immediately after access is granted.
- Refresh failures are swallowed by `refreshQuietly` because `refreshWatches` already logged and counted them.

**Acceptance Criteria**
- [ ] `npx jest tests/background.test.js` passes (22 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 182 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-24: Popup watch row builder
**Type:** UX
**Priority:** High
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/popup/watch-item.test.js, src/popup/watch-item.js

**Current State**
The legacy popup builds rows with `innerHTML` template strings (escaping by hand), makes the whole row an `<a href="#">`, shows "Read"/"Unread" text that is not updated after marking, ignores `last_error`, and has no way to open the monitored page separately from marking it read.

**Target State**
New `src/popup/watch-item.js` exporting:
- `watchMeta(watch, nowMs = Date.now())` → `'No changes yet'` when `last_changed` ≤ 0; `'Changed <relative>'`; prefixed `'Unread · '` when unread.
- `buildWatchItem(doc, watch, baseURL)` → `<li class="watch-item [unread] [has-error]" data-uuid>` containing `<a class="watch-main" href="primaryUrl">` with `.watch-title` (displayTitle), `.watch-meta` and — when `last_error` is a non-empty string — `.watch-error` (`⚠ <error>`, full text in `title`); plus, when `siteUrl(watch)` exists, `<a class="watch-site" target="_blank" rel="noopener" title="Open monitored page" aria-label="Open monitored page: <title>">↗</a>`. DOM APIs only — no `innerHTML`.

Public surface after this task (exact names and parameters):
- `src/popup/watch-item.js`: `export function watchMeta(watch, nowMs = Date.now()`
- `src/popup/watch-item.js`: `export function buildWatchItem(doc, watch, baseURL)`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/popup/watch-item.test.js` › watchMeta › never changed
- `tests/popup/watch-item.test.js` › watchMeta › changed and read
- `tests/popup/watch-item.test.js` › watchMeta › changed and unread
- `tests/popup/watch-item.test.js` › buildWatchItem › unread changed watch links to the diff page and the monitored page
- `tests/popup/watch-item.test.js` › buildWatchItem › titles are text, never HTML
- `tests/popup/watch-item.test.js` › buildWatchItem › read watch without an http(s) page has no site link
- `tests/popup/watch-item.test.js` › buildWatchItem › last_error adds a warning line with the full text as tooltip
- `tests/popup/watch-item.test.js` › buildWatchItem › last_error false adds nothing

**Implementation Steps**
1. Write the tests. Create `tests/popup/watch-item.test.js` with exactly this content:

```js
import { buildWatchItem, watchMeta } from '../../src/popup/watch-item.js';

const BASE = 'http://192.168.1.10:5000';
const NOW_MS = 1_700_000_000_000;
const TWO_HOURS_AGO = NOW_MS / 1000 - 7200;

describe('watchMeta', () => {
  test('never changed', () => {
    expect(watchMeta({ last_changed: 0, viewed: false }, NOW_MS)).toBe('No changes yet');
  });

  test('changed and read', () => {
    expect(watchMeta({ last_changed: TWO_HOURS_AGO, viewed: true }, NOW_MS)).toBe('Changed 2h ago');
  });

  test('changed and unread', () => {
    expect(watchMeta({ last_changed: TWO_HOURS_AGO, viewed: false }, NOW_MS)).toBe('Unread · Changed 2h ago');
  });
});

describe('buildWatchItem', () => {
  test('unread changed watch links to the diff page and the monitored page', () => {
    const item = buildWatchItem(document, {
      uuid: 'u1', title: 'Prices', url: 'https://shop.example/item', last_changed: TWO_HOURS_AGO, viewed: false,
    }, BASE);
    expect(item.tagName).toBe('LI');
    expect(item.className).toBe('watch-item unread');
    expect(item.dataset.uuid).toBe('u1');
    const main = item.querySelector('a.watch-main');
    expect(main.getAttribute('href')).toBe(`${BASE}/diff/u1`);
    expect(main.querySelector('.watch-title').textContent).toBe('Prices');
    expect(main.querySelector('.watch-meta').textContent).toMatch(/^Unread · Changed /);
    const site = item.querySelector('a.watch-site');
    expect(site.getAttribute('href')).toBe('https://shop.example/item');
    expect(site.target).toBe('_blank');
    expect(site.rel).toBe('noopener');
    expect(site.getAttribute('aria-label')).toBe('Open monitored page: Prices');
    expect(site.textContent).toBe('↗');
  });

  test('titles are text, never HTML', () => {
    const item = buildWatchItem(document, { uuid: 'x', title: '<img src=x onerror=alert(1)>', url: 'https://a', last_changed: 0, viewed: true }, BASE);
    expect(item.querySelector('img')).toBeNull();
    expect(item.querySelector('.watch-title').textContent).toBe('<img src=x onerror=alert(1)>');
  });

  test('read watch without an http(s) page has no site link', () => {
    const item = buildWatchItem(document, { uuid: 'x', url: 'file:///tmp', last_changed: 0, viewed: true }, BASE);
    expect(item.classList.contains('unread')).toBe(false);
    expect(item.querySelector('.watch-site')).toBeNull();
    expect(item.querySelector('.watch-main').getAttribute('href')).toBe(BASE);
  });

  test('last_error adds a warning line with the full text as tooltip', () => {
    const item = buildWatchItem(document, { uuid: 'x', url: 'https://a', last_changed: 0, viewed: true, last_error: 'Timeout after 30s' }, BASE);
    expect(item.classList.contains('has-error')).toBe(true);
    const error = item.querySelector('.watch-error');
    expect(error.textContent).toBe('⚠ Timeout after 30s');
    expect(error.title).toBe('Timeout after 30s');
  });

  test('last_error false adds nothing', () => {
    const item = buildWatchItem(document, { uuid: 'x', url: 'https://a', last_changed: 0, viewed: true, last_error: false }, BASE);
    expect(item.querySelector('.watch-error')).toBeNull();
    expect(item.classList.contains('has-error')).toBe(false);
  });
});
```
2. Run `npx jest tests/popup/watch-item.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/popup/watch-item.test.js && git commit -m "test: add tests for the popup watch row builder"`
4. Create `src/popup/watch-item.js` with exactly this content:

```js
/**
 * @file Builds the list item for one watch in the popup.
 *
 * Uses DOM APIs only (no innerHTML), so watch titles and errors are never parsed as HTML.
 */
import { formatRelativeTime } from '../lib/format.js';
import { displayTitle, isUnread, primaryUrl, siteUrl } from '../lib/watches.js';

/**
 * Secondary text shown under a watch title.
 *
 * @param {import('../lib/watches.js').Watch} watch - The watch.
 * @param {number} [nowMs] - Current time in milliseconds; defaults to Date.now().
 * @returns {string} 'No changes yet', 'Changed 2h ago', or 'Unread · Changed 2h ago'.
 */
export function watchMeta(watch, nowMs = Date.now()) {
  const lastChanged = Number(watch.last_changed) || 0;
  if (lastChanged <= 0) return 'No changes yet';
  const changed = `Changed ${formatRelativeTime(lastChanged, nowMs)}`;
  return isUnread(watch) ? `Unread · ${changed}` : changed;
}

/**
 * Build the `<li>` for one watch.
 *
 * @param {Document} doc - Document used to create elements.
 * @param {import('../lib/watches.js').Watch} watch - The watch.
 * @param {string} baseURL - Normalized server URL.
 * @returns {HTMLLIElement} `li.watch-item` holding `a.watch-main` and, when the watch has an http(s) page, `a.watch-site`.
 */
export function buildWatchItem(doc, watch, baseURL) {
  const item = doc.createElement('li');
  item.className = 'watch-item';
  item.classList.toggle('unread', isUnread(watch));
  item.dataset.uuid = watch.uuid;

  const main = doc.createElement('a');
  main.className = 'watch-main';
  main.href = primaryUrl(baseURL, watch);
  const title = doc.createElement('span');
  title.className = 'watch-title';
  title.textContent = displayTitle(watch);
  const meta = doc.createElement('span');
  meta.className = 'watch-meta';
  meta.textContent = watchMeta(watch);
  main.append(title, meta);

  if (typeof watch.last_error === 'string' && watch.last_error) {
    item.classList.add('has-error');
    const error = doc.createElement('span');
    error.className = 'watch-error';
    error.title = watch.last_error;
    error.textContent = `⚠ ${watch.last_error}`;
    main.append(error);
  }
  item.append(main);

  const site = siteUrl(watch);
  if (site) {
    const link = doc.createElement('a');
    link.className = 'watch-site';
    link.href = site;
    link.target = '_blank';
    link.rel = 'noopener';
    link.title = 'Open monitored page';
    link.setAttribute('aria-label', `Open monitored page: ${displayTitle(watch)}`);
    link.textContent = '↗';
    item.append(link);
  }
  return item;
}
```
5. Light checks: `npm run lint` must exit 0, then `npx jest tests/popup/watch-item.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
6. Commit: `git add src/popup/watch-item.js && git commit -m "feat: build popup watch rows safely with diff link, site link and error marker"`

**Context for Implementor**
Watch object = one value of `GET /api/v1/watch` (an object keyed by UUID) plus `uuid`: `url`, `title` (string|null), `page_title` (string|null), `link`, `open_link`, `last_changed` (Unix seconds; 0 until the watch has two snapshots), `last_checked`, `last_error` (string or false), `viewed` (boolean — a brand-new watch reports false). Unread ⇔ `last_changed > 0 && viewed === false`.
- JSDoc rule: a type defined with `@typedef` in another file must be written `import('./watches.js').Watch` (or the right relative path); a bare `Watch` fails `jsdoc/no-undefined-types`.

**Acceptance Criteria**
- [ ] `npx jest tests/popup/watch-item.test.js` passes (8 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 190 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-25: Popup markup and styles (dark mode, accessibility)
**Type:** UX
**Priority:** High
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/popup/popup-markup.test.js, src/popup/popup.html, src/popup/popup.css

**Current State**
`popup.html` toggles states with inline `style="display: none"`, uses an emoji-only settings button without an accessible name, has no status line, no place for "Watch this page", a filter or "Recheck all", and loads `popup.js` as a classic script. `popup.css` has fixed light colours, no focus styles and a `.watch-url` rule nothing uses.

**Target State**
`src/popup/popup.html` and `src/popup/popup.css` replaced as given: every section hidden with the `hidden` attribute (`[hidden] { display: none !important; }` in CSS); header with title link, `↻` Refresh and `⚙` Settings icon buttons (`aria-label`s); `#statusLine` (`role="status"`, `aria-live="polite"`); loading/error (with hidden Grant access button)/no-config states; watches section with `#pageBar`, `#filterBar`, `<ul id="watchesContainer">`, `#emptyMessage` and a footer with **Mark all viewed** and **Recheck all**; `<script type="module" src="popup.js">`. CSS uses custom properties with a `prefers-color-scheme: dark` palette, `:focus-visible` outlines and `prefers-reduced-motion`.

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/popup/popup-markup.test.js` › popup.html › contains every element the popup script uses
- `tests/popup/popup-markup.test.js` › popup.html › starts with every optional section hidden
- `tests/popup/popup-markup.test.js` › popup.html › loads popup.js as a module and labels icon buttons and live regions
- `tests/popup/popup-markup.test.js` › popup.css › lets the hidden attribute win over display rules
- `tests/popup/popup-markup.test.js` › popup.css › has a dark theme, focus rings and reduced motion

**Implementation Steps**
1. Write the tests. Create `tests/popup/popup-markup.test.js` with exactly this content:

```js
import fs from 'node:fs';
import path from 'node:path';
import { loadHtml } from '../helpers/dom.js';

const IDS = [
  'titleLink', 'refreshBtn', 'settingsBtn', 'statusLine', 'loadingState', 'errorState', 'errorMessage',
  'grantBtn', 'retryBtn', 'noConfigState', 'configureBtn', 'watchesList', 'pageBar', 'watchPageBtn',
  'pageStatus', 'filterBar', 'filterInput', 'watchesContainer', 'emptyMessage', 'markAllBtn', 'recheckAllBtn',
];

describe('popup.html', () => {
  beforeEach(() => loadHtml('src/popup/popup.html'));

  test('contains every element the popup script uses', () => {
    for (const id of IDS) expect(document.getElementById(id)).not.toBeNull();
  });

  test('starts with every optional section hidden', () => {
    for (const id of ['loadingState', 'errorState', 'noConfigState', 'watchesList', 'grantBtn', 'pageBar', 'filterBar', 'emptyMessage']) {
      expect(document.getElementById(id).hidden).toBe(true);
    }
  });

  test('loads popup.js as a module and labels icon buttons and live regions', () => {
    expect(document.querySelector('script[type="module"][src="popup.js"]')).not.toBeNull();
    expect(document.getElementById('refreshBtn').getAttribute('aria-label')).toBe('Refresh');
    expect(document.getElementById('settingsBtn').getAttribute('aria-label')).toBe('Settings');
    expect(document.getElementById('filterInput').getAttribute('aria-label')).toBe('Filter watches');
    expect(document.getElementById('statusLine').getAttribute('aria-live')).toBe('polite');
    expect(document.getElementById('watchesContainer').tagName).toBe('UL');
    expect(document.getElementById('markAllBtn').textContent).toBe('Mark all viewed');
  });
});

describe('popup.css', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', '..', 'src/popup/popup.css'), 'utf8');

  test('lets the hidden attribute win over display rules', () => {
    expect(css).toContain('[hidden] {\n  display: none !important;\n}');
  });

  test('has a dark theme, focus rings and reduced motion', () => {
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain(':focus-visible');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
```
2. Run `npx jest tests/popup/popup-markup.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/popup/popup-markup.test.js && git commit -m "test: pin popup markup ids, accessibility attributes and theme rules"`
4. Replace the entire content of `src/popup/popup.html` with exactly:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>ChangeDetection.io Monitor</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <header class="header">
    <a id="titleLink" class="title-link" href="#" target="_blank" rel="noopener">ChangeDetection.io</a>
    <div class="header-actions">
      <button id="refreshBtn" class="icon-btn" type="button" title="Refresh" aria-label="Refresh">↻</button>
      <button id="settingsBtn" class="icon-btn" type="button" title="Settings" aria-label="Settings">⚙</button>
    </div>
  </header>

  <p id="statusLine" class="status-line" role="status" aria-live="polite"></p>

  <section id="loadingState" class="state" hidden>
    <div class="spinner" aria-hidden="true"></div>
    <p>Loading watches…</p>
  </section>

  <section id="errorState" class="state state-error" hidden>
    <p id="errorMessage"></p>
    <div class="state-actions">
      <button id="grantBtn" class="btn btn-primary" type="button" hidden>Grant access</button>
      <button id="retryBtn" class="btn" type="button">Retry</button>
    </div>
  </section>

  <section id="noConfigState" class="state" hidden>
    <p>Connect the extension to your changedetection.io server.</p>
    <button id="configureBtn" class="btn btn-primary" type="button">Open settings</button>
  </section>

  <section id="watchesList" hidden>
    <div id="pageBar" class="page-bar" hidden>
      <button id="watchPageBtn" class="btn btn-small" type="button">+ Watch this page</button>
      <span id="pageStatus" class="page-status"></span>
    </div>
    <div id="filterBar" class="filter-bar" hidden>
      <input id="filterInput" type="search" placeholder="Filter watches" aria-label="Filter watches">
    </div>
    <ul id="watchesContainer" class="watch-list"></ul>
    <p id="emptyMessage" class="empty" hidden></p>
    <footer class="footer">
      <button id="markAllBtn" class="btn btn-primary" type="button">Mark all viewed</button>
      <button id="recheckAllBtn" class="btn" type="button">Recheck all</button>
    </footer>
  </section>

  <script type="module" src="popup.js"></script>
</body>
</html>
```
5. Replace the entire content of `src/popup/popup.css` with exactly:

```css
:root {
  color-scheme: light dark;
  --bg: #f6f7fb;
  --surface: #ffffff;
  --text: #1f2330;
  --muted: #5f6675;
  --border: #dde1ea;
  --accent: #5a67d8;
  --accent-hover: #4c56c0;
  --accent-contrast: #ffffff;
  --unread: #d93025;
  --warning: #9a5b00;
  --focus: #7c8cff;
  --header-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #15171e;
    --surface: #1f222b;
    --text: #e7e9ef;
    --muted: #a3a9b7;
    --border: #323644;
    --accent: #7f8cff;
    --accent-hover: #95a0ff;
    --accent-contrast: #0f1117;
    --unread: #ff6b61;
    --warning: #f2b84b;
    --focus: #a5b0ff;
  }
}

[hidden] {
  display: none !important;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  width: 360px;
  max-height: 600px;
  background: var(--bg);
  color: var(--text);
  font: 14px/1.4 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 14px;
  background: var(--header-bg);
  color: #ffffff;
}

.title-link {
  color: inherit;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
}

.title-link:hover {
  text-decoration: underline;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.icon-btn {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font-size: 16px;
  cursor: pointer;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.status-line {
  min-height: 1.4em;
  margin: 0;
  padding: 4px 14px;
  color: var(--muted);
  font-size: 12px;
}

.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 20px;
  text-align: center;
}

.state p {
  margin: 0;
}

.state-error p {
  color: var(--unread);
  overflow-wrap: anywhere;
}

.state-actions {
  display: flex;
  gap: 8px;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation-duration: 3s;
  }
}

.btn {
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.btn:hover:not(:disabled) {
  border-color: var(--accent);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-primary {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--accent-contrast);
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn-small {
  padding: 4px 10px;
  font-size: 12px;
}

.page-bar,
.filter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
}

.page-status {
  color: var(--muted);
  font-size: 12px;
  overflow-wrap: anywhere;
}

.filter-bar input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text);
  font: inherit;
}

.watch-list {
  max-height: 400px;
  margin: 0;
  padding: 4px 10px 10px;
  overflow-y: auto;
  list-style: none;
}

.watch-item {
  display: flex;
  align-items: stretch;
  margin-bottom: 6px;
  border: 1px solid var(--border);
  border-left: 4px solid transparent;
  border-radius: 6px;
  background: var(--surface);
}

.watch-item:hover {
  border-color: var(--accent);
}

.watch-item.unread,
.watch-item.unread:hover {
  border-left-color: var(--unread);
}

.watch-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  padding: 8px 10px;
  color: inherit;
  text-decoration: none;
}

.watch-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.watch-item.unread .watch-title {
  font-weight: 600;
}

.watch-meta {
  color: var(--muted);
  font-size: 11px;
}

.watch-error {
  overflow: hidden;
  color: var(--warning);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.watch-site {
  display: flex;
  align-items: center;
  padding: 0 10px;
  border-left: 1px solid var(--border);
  color: var(--muted);
  text-decoration: none;
}

.watch-site:hover {
  color: var(--accent);
}

.empty {
  margin: 0;
  padding: 24px 20px;
  color: var(--muted);
  text-align: center;
}

.footer {
  position: sticky;
  bottom: 0;
  display: flex;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid var(--border);
  background: var(--surface);
}

.footer .btn {
  flex: 1;
}
```
6. Light checks: `npm run lint` must exit 0, then `npx jest tests/popup/popup-markup.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
7. Commit: `git add src/popup/popup.html src/popup/popup.css && git commit -m "feat: accessible dark-mode popup markup and styles"`

**Context for Implementor**
- Element ids are the contract with `popup.js` (next task): `titleLink, refreshBtn, settingsBtn, statusLine, loadingState, errorState, errorMessage, grantBtn, retryBtn, noConfigState, configureBtn, watchesList, pageBar, watchPageBtn, pageStatus, filterBar, filterInput, watchesContainer, emptyMessage, markAllBtn, recheckAllBtn`.
- The legacy `popup.js` (still a classic script) will not render correctly with this markup; it is replaced by the next task — do not edit it here.

**Acceptance Criteria**
- [ ] `npx jest tests/popup/popup-markup.test.js` passes (5 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 195 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-26: Popup controller core rewrite
**Type:** Refactor
**Priority:** High
**Effort:** Medium (1–2 h)
**Tier:** Haiku
**Files:** tests/popup/popup.test.js, src/popup/popup.js, eslint.config.mjs

**Current State**
Legacy `src/popup/popup.js` duplicates settings loading, message sending, normalisation, unread logic and date formatting; uses `style.display`; checks the `tabs` permission before opening a tab; and cannot be imported by tests.

**Target State**
`src/popup/popup.js` replaced by an ES module exporting `class PopupManager` (constructor `(doc = document)` looks up all element ids into `this.el`, sets `settings`, `watches`, `fetchedAt`, calls `bindEvents()`), with `bindEvents()` (Settings/Open settings → `chrome.runtime.openOptionsPage()`, Refresh/Retry → `refresh()`), `init()` (not configured → `noConfig`; else title link → `baseURL`, `loading`, `refresh()`), `showState(state)` (`hidden` on the four sections), `setStatus(text)`, `showError(message, kind)` (Grant access visible only for `kind === 'permission'`), `refresh()` (`getWatches`; success → render + `Updated <relative>`; failure → WARN log + error state) and `render()` (sorted rows via `buildWatchItem`, empty message `No watches yet.`); bootstrap on `DOMContentLoaded` logging `Popup failed to start: %s` on error. `src/popup/popup.js` is removed from `LEGACY_FILES`. Later tasks each add one feature.

Public surface after this task (exact names and parameters):
- `src/popup/popup.js`: `export class PopupManager`
- `src/popup/popup.js`: method `constructor(doc = document)`
- `src/popup/popup.js`: method `bindEvents()`
- `src/popup/popup.js`: method `async init()`
- `src/popup/popup.js`: method `showState(state)`
- `src/popup/popup.js`: method `setStatus(text)`
- `src/popup/popup.js`: method `showError(message, kind)`
- `src/popup/popup.js`: method `async refresh()`
- `src/popup/popup.js`: method `render()`

Log lines this task adds (level and exact format string, arguments as in the code below):
- WARN `Could not load watches: %s`
- ERROR `Popup failed to start: %s`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/popup/popup.test.js` › init and refresh › not configured shows the settings prompt without messaging
- `tests/popup/popup.test.js` › init and refresh › configured: renders sorted watches, links the title, shows status
- `tests/popup/popup.test.js` › init and refresh › empty list shows the empty message
- `tests/popup/popup.test.js` › init and refresh › failure shows the error state and logs a warning
- `tests/popup/popup.test.js` › init and refresh › a permission failure reveals the Grant access button
- `tests/popup/popup.test.js` › init and refresh › refresh and retry buttons refetch; settings buttons open options
- `tests/popup/popup.test.js` › bootstrap › DOMContentLoaded starts the popup
- `tests/popup/popup.test.js` › bootstrap › start-up failures are logged

**Implementation Steps**
1. Write the tests. Create `tests/popup/popup.test.js` with exactly this content:

```js
import { PopupManager } from '../../src/popup/popup.js';
import { loadHtml } from '../helpers/dom.js';
import { hasLog } from '../helpers/logs.js';

const BASE = 'http://192.168.1.10:5000';

/**
 * Build a watch.
 *
 * @param {string} uuid - UUID.
 * @param {object} overrides - Fields to override.
 * @returns {object} Watch.
 */
function watch(uuid, overrides = {}) {
  return { uuid, title: uuid.toUpperCase(), url: `https://${uuid}.example/`, last_changed: 0, viewed: true, ...overrides };
}

/**
 * Route runtime.sendMessage by action.
 *
 * @param {object} responses - Map of action name to response object or function(request).
 */
function answer(responses) {
  chrome.runtime.sendMessage.mockImplementation(async (request) => {
    const response = responses[request.action];
    return typeof response === 'function' ? response(request) : response;
  });
}

/**
 * Load popup.html, store settings and create the manager.
 *
 * @returns {Promise<PopupManager>} Manager (not yet initialised).
 */
async function setup() {
  loadHtml('src/popup/popup.html');
  await chrome.storage.sync.set({ baseURL: BASE, apiKey: 'key' });
  return new PopupManager(document);
}

/**
 * Visible row UUIDs in display order.
 *
 * @returns {string[]} UUIDs.
 */
function rows() {
  return [...document.querySelectorAll('#watchesContainer .watch-item')].map((li) => li.dataset.uuid);
}

/**
 * Which of the four states is visible.
 *
 * @returns {string[]} Visible state element IDs.
 */
function visibleStates() {
  return ['loadingState', 'errorState', 'noConfigState', 'watchesList'].filter((id) => !document.getElementById(id).hidden);
}

describe('init and refresh', () => {
  test('not configured shows the settings prompt without messaging', async () => {
    loadHtml('src/popup/popup.html');
    await new PopupManager(document).init();
    expect(visibleStates()).toEqual(['noConfigState']);
    expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
  });

  test('configured: renders sorted watches, links the title, shows status', async () => {
    const popup = await setup();
    answer({
      getWatches: {
        success: true,
        data: { watches: [watch('a'), watch('b', { last_changed: 100, viewed: false })], fetchedAt: Date.now() },
      },
    });
    await popup.init();
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ action: 'getWatches' });
    expect(visibleStates()).toEqual(['watchesList']);
    expect(rows()).toEqual(['b', 'a']);
    expect(document.getElementById('titleLink').getAttribute('href')).toBe(BASE);
    expect(document.getElementById('statusLine').textContent).toBe('Updated just now');
  });

  test('empty list shows the empty message', async () => {
    const popup = await setup();
    answer({ getWatches: { success: true, data: { watches: [], fetchedAt: Date.now() } } });
    await popup.init();
    expect(document.getElementById('emptyMessage').hidden).toBe(false);
    expect(document.getElementById('emptyMessage').textContent).toBe('No watches yet.');
  });

  test('failure shows the error state and logs a warning', async () => {
    const popup = await setup();
    answer({ getWatches: { success: false, error: 'Cannot reach http://x', errorKind: 'network' } });
    await popup.init();
    expect(visibleStates()).toEqual(['errorState']);
    expect(document.getElementById('errorMessage').textContent).toBe('Cannot reach http://x');
    expect(document.getElementById('grantBtn').hidden).toBe(true);
    expect(document.getElementById('statusLine').textContent).toBe('');
    expect(hasLog('warn', '[cdio:popup] Could not load watches: Cannot reach http://x')).toBe(true);
  });

  test('a permission failure reveals the Grant access button', async () => {
    const popup = await setup();
    answer({ getWatches: { success: false, error: 'Access to x is not granted', errorKind: 'permission' } });
    await popup.init();
    expect(visibleStates()).toEqual(['errorState']);
    expect(document.getElementById('grantBtn').hidden).toBe(false);
  });

  test('refresh and retry buttons refetch; settings buttons open options', async () => {
    const popup = await setup();
    answer({ getWatches: { success: true, data: { watches: [], fetchedAt: Date.now() } } });
    await popup.init();
    chrome.runtime.sendMessage.mockClear();
    document.getElementById('refreshBtn').click();
    document.getElementById('retryBtn').click();
    expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(2);
    document.getElementById('settingsBtn').click();
    document.getElementById('configureBtn').click();
    expect(chrome.runtime.openOptionsPage).toHaveBeenCalledTimes(2);
  });
});

describe('bootstrap', () => {
  test('DOMContentLoaded starts the popup', async () => {
    loadHtml('src/popup/popup.html');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.getElementById('noConfigState').hidden).toBe(false);
  });

  test('start-up failures are logged', async () => {
    loadHtml('src/popup/popup.html');
    chrome.storage.sync.get.mockRejectedValueOnce(new Error('storage down'));
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(hasLog('error', '[cdio:popup] Popup failed to start: storage down')).toBe(true);
  });
});
```
2. Run `npx jest tests/popup/popup.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/popup/popup.test.js && git commit -m "test: add popup controller tests"`
4. Replace the entire content of `src/popup/popup.js` with exactly:

```js
/**
 * @file Popup page controller: lists the user's watches and runs the actions offered on them.
 *
 * All server work goes through the service worker (lib/messages.js), so it completes even
 * when the popup closes.
 */
import { formatRelativeTime } from '../lib/format.js';
import { createLogger } from '../lib/log.js';
import { ACTIONS, sendMessage } from '../lib/messages.js';
import { isConfigured, loadSettings } from '../lib/settings.js';
import { sortWatches } from '../lib/watches.js';
import { buildWatchItem } from './watch-item.js';

const log = createLogger('popup');

const ELEMENT_IDS = [
  'titleLink', 'refreshBtn', 'settingsBtn', 'statusLine', 'loadingState', 'errorState', 'errorMessage',
  'grantBtn', 'retryBtn', 'noConfigState', 'configureBtn', 'watchesList', 'pageBar', 'watchPageBtn',
  'pageStatus', 'filterBar', 'filterInput', 'watchesContainer', 'emptyMessage', 'markAllBtn', 'recheckAllBtn',
];

const STATE_ELEMENTS = { loading: 'loadingState', error: 'errorState', noConfig: 'noConfigState', watches: 'watchesList' };

/** Controller for popup.html. */
export class PopupManager {
  /**
   * Look up the popup elements and wire their events.
   *
   * @param {Document} [doc] - Document holding popup.html; defaults to the global document.
   */
  constructor(doc = document) {
    this.doc = doc;
    this.el = Object.fromEntries(ELEMENT_IDS.map((id) => [id, doc.getElementById(id)]));
    this.settings = null;
    this.watches = [];
    this.fetchedAt = 0;
    this.bindEvents();
  }

  /** Attach event listeners to buttons, the filter and the list. */
  bindEvents() {
    const openSettings = () => chrome.runtime.openOptionsPage();
    this.el.settingsBtn.addEventListener('click', openSettings);
    this.el.configureBtn.addEventListener('click', openSettings);
    this.el.refreshBtn.addEventListener('click', () => this.refresh());
    this.el.retryBtn.addEventListener('click', () => this.refresh());
  }

  /**
   * Load settings, then fetch and show the watches.
   *
   * @returns {Promise<void>} Resolves when the first refresh finished.
   */
  async init() {
    this.settings = await loadSettings();
    if (!isConfigured(this.settings)) {
      this.showState('noConfig');
      return;
    }
    this.el.titleLink.href = this.settings.baseURL;
    this.showState('loading');
    await this.refresh();
  }

  /**
   * Show exactly one of the four page states.
   *
   * @param {'loading'|'error'|'noConfig'|'watches'} state - State to show.
   */
  showState(state) {
    for (const [name, id] of Object.entries(STATE_ELEMENTS)) this.el[id].hidden = name !== state;
  }

  /**
   * Set the one-line status text under the header.
   *
   * @param {string} text - Status text; '' clears it.
   */
  setStatus(text) {
    this.el.statusLine.textContent = text;
  }

  /**
   * Show the error state.
   *
   * @param {string} message - User-safe error message.
   * @param {string} [kind] - ApiError kind; 'permission' reveals the Grant access button.
   */
  showError(message, kind) {
    this.el.errorMessage.textContent = message;
    this.el.grantBtn.hidden = kind !== 'permission';
    this.setStatus('');
    this.showState('error');
  }

  /**
   * Fetch watches through the service worker and render them.
   *
   * @returns {Promise<void>} Resolves when the list or an error is shown.
   */
  async refresh() {
    this.setStatus('Refreshing…');
    const response = await sendMessage({ action: ACTIONS.GET_WATCHES });
    if (response.success) {
      this.watches = response.data.watches;
      this.fetchedAt = response.data.fetchedAt;
      this.render();
      this.showState('watches');
      this.setStatus(`Updated ${formatRelativeTime(Math.floor(this.fetchedAt / 1000))}`);
      return;
    }
    log.warn('Could not load watches: %s', response.error);
    this.showError(response.error, response.errorKind);
  }

  /** Rebuild the list from this.watches in display order. */
  render() {
    const visible = sortWatches(this.watches);
    this.el.watchesContainer.replaceChildren(
      ...visible.map((watch) => buildWatchItem(this.doc, watch, this.settings.baseURL)),
    );
    this.el.emptyMessage.hidden = visible.length > 0;
    this.el.emptyMessage.textContent = 'No watches yet.';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PopupManager().init().catch((error) => log.error('Popup failed to start: %s', error.message));
});
```
5. In `eslint.config.mjs`, replace this exact text (it occurs exactly once):

```js
const LEGACY_FILES = ['src/popup/popup.js', 'src/options/options.js'];
```

with:

```js
const LEGACY_FILES = ['src/options/options.js'];
```
6. Light checks: `npm run lint` must exit 0, then `npx jest tests/popup/popup.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
7. Commit: `git add src/popup/popup.js eslint.config.mjs && git commit -m "refactor: rewrite popup controller as a tested ES module"`

**Context for Implementor**
Message contract (`src/lib/messages.js` `ACTIONS`; the popup/options pages send, the service worker answers `{success: true, data?}` or `{success: false, error, errorKind?}`):
- `getWatches` `{}` → data `{watches: Watch[], fetchedAt: number}` (runs a full refresh).
- `openWatch` `{uuid, url, lastChanged, background}` → no data (opens the tab; marks viewed when `lastChanged > 0`).
- `markAllViewed` `{items: [{uuid, lastChanged}]}` → data `{markedUuids: string[], failed: number}`.
- `testConnection` `{baseURL, apiKey}` → data `{version: string, watchCount: number}` (nothing is saved).
- `addWatch` `{url}` → data `{uuid: string}`.
- `recheckAll` `{}` → data `{message: string}`.
- Later tasks append methods at the end of the class, append lines at the end of `bindEvents()`, and replace `init()`, `refresh()` or `render()` by exact text — keep the given code byte-for-byte.
- Test environment: `globalThis.chrome` is the in-memory fake from `tests/helpers/chrome-fake.js`, reset before every test (storage emptied, mocks fresh, event listeners kept); `fetch` is a fresh `jest.fn()` per test; `console.*` is silenced and recorded — `hasLog(level, pattern)` / `allLogText()` from `tests/helpers/logs.js` assert on it.

**Acceptance Criteria**
- [ ] `npx jest tests/popup/popup.test.js` passes (8 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 203 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-27: Popup: open watches (diff, background tabs)
**Type:** UX
**Priority:** High
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/popup/popup.test.js, src/popup/popup.js

**Current State**
After the core rewrite, clicking a row does nothing yet (rows are anchors; the browser would navigate the popup).

**Target State**
- `bindEvents()` also listens to `click` and `auxclick` on `#watchesContainer`.
- `onListClick(event)` → ignores clicks outside `.watch-main` and non-middle `auxclick`; `preventDefault()`; background = middle-click or Ctrl/Cmd; calls `openWatch`.
- `openWatch(watch, background)` → marks the row read immediately when unread (optimistic `viewed = true` + `render()`), sends `openWatch` `{uuid, url: primaryUrl(baseURL, watch), lastChanged, background}`; on failure status `Could not mark as viewed: <error>`.
- The ↗ link (`.watch-site`) keeps its native behaviour (new tab, no marking).

Public surface after this task (exact names and parameters):
- `src/popup/popup.js`: method `onListClick(event)`
- `src/popup/popup.js`: method `async openWatch(watch, background)`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/popup/popup.test.js` › opening watches › click opens the diff page in the foreground and marks the row read
- `tests/popup/popup.test.js` › opening watches › ctrl/cmd-click and middle-click open in the background
- `tests/popup/popup.test.js` › opening watches › right-click (auxclick button 2) and clicks outside rows are ignored
- `tests/popup/popup.test.js` › opening watches › a failed openWatch is reported in the status line

**Implementation Steps**
1. Write the tests. Append the following to the end of `tests/popup/popup.test.js` (keep everything already in the file):

```js
describe('opening watches', () => {
  /**
   * Initialise with one unread and one never-changed watch.
   *
   * @returns {Promise<PopupManager>} Manager.
   */
  async function ready() {
    const popup = await setup();
    answer({
      getWatches: {
        success: true,
        data: { watches: [watch('u', { last_changed: 100, viewed: false }), watch('n')], fetchedAt: Date.now() },
      },
      openWatch: { success: true },
    });
    await popup.init();
    chrome.runtime.sendMessage.mockClear();
    return popup;
  }

  test('click opens the diff page in the foreground and marks the row read', async () => {
    const popup = await ready();
    const main = document.querySelector('[data-uuid="u"] .watch-main');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    main.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      action: 'openWatch', uuid: 'u', url: `${BASE}/diff/u`, lastChanged: 100, background: false,
    });
    expect(document.querySelector('[data-uuid="u"]').classList.contains('unread')).toBe(false);
    expect(popup.watches.find((w) => w.uuid === 'u').viewed).toBe(true);
  });

  test('ctrl/cmd-click and middle-click open in the background', async () => {
    await ready();
    const main = () => document.querySelector('[data-uuid="n"] .watch-main');
    main().dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }));
    main().dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, metaKey: true }));
    main().dispatchEvent(new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 1 }));
    const calls = chrome.runtime.sendMessage.mock.calls.map(([request]) => request);
    expect(calls).toHaveLength(3);
    expect(calls.every((request) => request.background === true && request.url === 'https://n.example/')).toBe(true);
  });

  test('right-click (auxclick button 2) and clicks outside rows are ignored', async () => {
    await ready();
    document.querySelector('[data-uuid="n"] .watch-main')
      .dispatchEvent(new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 2 }));
    document.getElementById('watchesContainer').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
  });

  test('a failed openWatch is reported in the status line', async () => {
    const popup = await ready();
    answer({ openWatch: { success: false, error: 'Server error (HTTP 500)' } });
    await popup.openWatch(popup.watches[0], false);
    expect(document.getElementById('statusLine').textContent).toBe('Could not mark as viewed: Server error (HTTP 500)');
  });
});
```
2. Run `npx jest tests/popup/popup.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/popup/popup.test.js && git commit -m "test: add popup open-watch tests"`
4. In `src/popup/popup.js`, replace this exact text (it occurs exactly once):

```js
import { sortWatches } from '../lib/watches.js';
```

with:

```js
import { isUnread, primaryUrl, sortWatches } from '../lib/watches.js';
```
5. In `src/popup/popup.js`, replace this exact text (it occurs exactly once):

```js
    this.el.retryBtn.addEventListener('click', () => this.refresh());
  }
```

with:

```js
    this.el.retryBtn.addEventListener('click', () => this.refresh());
    this.el.watchesContainer.addEventListener('click', (event) => this.onListClick(event));
    this.el.watchesContainer.addEventListener('auxclick', (event) => this.onListClick(event));
  }
```
6. In `src/popup/popup.js`, insert the following as the last methods of class `PopupManager` (immediately before the class's closing `}` that precedes `document.addEventListener('DOMContentLoaded'`):

```js
  /**
   * Handle click and middle-click on a watch row.
   *
   * @param {MouseEvent} event - click or auxclick event from the list.
   * @returns {Promise<void>|undefined} The openWatch promise when a row was activated.
   */
  onListClick(event) {
    const main = event.target.closest('.watch-main');
    if (!main) return undefined;
    if (event.type === 'auxclick' && event.button !== 1) return undefined;
    event.preventDefault();
    const watch = this.watches.find((candidate) => candidate.uuid === main.closest('.watch-item').dataset.uuid);
    if (!watch) return undefined;
    const background = event.type === 'auxclick' || event.ctrlKey || event.metaKey;
    return this.openWatch(watch, background);
  }

  /**
   * Open a watch (diff page when changed) and mark it viewed.
   *
   * @param {import('../lib/watches.js').Watch} watch - The watch.
   * @param {boolean} background - Open the tab in the background and keep the popup open.
   * @returns {Promise<void>} Resolves when the service worker answered.
   */
  async openWatch(watch, background) {
    const request = {
      action: ACTIONS.OPEN_WATCH,
      uuid: watch.uuid,
      url: primaryUrl(this.settings.baseURL, watch),
      lastChanged: Number(watch.last_changed) || 0,
      background,
    };
    if (isUnread(watch)) {
      watch.viewed = true;
      this.render();
    }
    const response = await sendMessage(request);
    if (!response.success) this.setStatus(`Could not mark as viewed: ${response.error}`);
  }
```
7. Light checks: `npm run lint` must exit 0, then `npx jest tests/popup/popup.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
8. Commit: `git add src/popup/popup.js && git commit -m "feat: open watch diffs from the popup, with background-tab modifiers"`

**Context for Implementor**
Message contract (`src/lib/messages.js` `ACTIONS`; the popup/options pages send, the service worker answers `{success: true, data?}` or `{success: false, error, errorKind?}`):
- `getWatches` `{}` → data `{watches: Watch[], fetchedAt: number}` (runs a full refresh).
- `openWatch` `{uuid, url, lastChanged, background}` → no data (opens the tab; marks viewed when `lastChanged > 0`).
- `markAllViewed` `{items: [{uuid, lastChanged}]}` → data `{markedUuids: string[], failed: number}`.
- `testConnection` `{baseURL, apiKey}` → data `{version: string, watchCount: number}` (nothing is saved).
- `addWatch` `{url}` → data `{uuid: string}`.
- `recheckAll` `{}` → data `{message: string}`.
- A foreground tab closes the popup; the service worker completes the marking.

**Acceptance Criteria**
- [ ] `npx jest tests/popup/popup.test.js` passes (12 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 207 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-28: Popup: mark all viewed
**Type:** Bug Fix
**Priority:** High
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/popup/popup.test.js, src/popup/popup.js

**Current State**
The legacy "Mark all as watched" sent one message per watch sequentially, left the rows reading "Unread" after success, and was enabled even with nothing unread.

**Target State**
- `bindEvents()` wires **Mark all viewed** to `markAllViewed()`; `render()` disables the button when no watch is unread.
- `markAllViewed()` → nothing when no unread; else disables the button, sends ONE `markAllViewed` message with `items: [{uuid, lastChanged}]`, marks exactly `data.markedUuids` viewed, re-renders, and sets status `Marked N viewed` or `Marked N of M viewed; F failed`; on message failure `Could not mark watches viewed: <error>`.

Public surface after this task (exact names and parameters):
- `src/popup/popup.js`: method `render()`
- `src/popup/popup.js`: method `async markAllViewed()`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/popup/popup.test.js` › mark all viewed › the button is enabled only while something is unread
- `tests/popup/popup.test.js` › mark all viewed › sends every unread watch once and marks the successes
- `tests/popup/popup.test.js` › mark all viewed › all succeed
- `tests/popup/popup.test.js` › mark all viewed › nothing unread sends nothing; failure is reported

**Implementation Steps**
1. Write the tests. Append the following to the end of `tests/popup/popup.test.js` (keep everything already in the file):

```js
describe('mark all viewed', () => {
  test('the button is enabled only while something is unread', async () => {
    const popup = await setup();
    answer({ getWatches: { success: true, data: { watches: [watch('a')], fetchedAt: Date.now() } } });
    await popup.init();
    expect(document.getElementById('markAllBtn').disabled).toBe(true);
    answer({ getWatches: { success: true, data: { watches: [watch('b', { last_changed: 5, viewed: false })], fetchedAt: Date.now() } } });
    await popup.refresh();
    expect(document.getElementById('markAllBtn').disabled).toBe(false);
  });

  test('sends every unread watch once and marks the successes', async () => {
    const popup = await setup();
    const watches = [watch('a', { last_changed: 10, viewed: false }), watch('b', { last_changed: 20, viewed: false }), watch('c')];
    answer({
      getWatches: { success: true, data: { watches, fetchedAt: Date.now() } },
      markAllViewed: { success: true, data: { markedUuids: ['a'], failed: 1 } },
    });
    await popup.init();
    chrome.runtime.sendMessage.mockClear();
    document.getElementById('markAllBtn').click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(1);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      action: 'markAllViewed',
      items: [{ uuid: 'a', lastChanged: 10 }, { uuid: 'b', lastChanged: 20 }],
    });
    expect(document.querySelector('[data-uuid="a"]').classList.contains('unread')).toBe(false);
    expect(document.querySelector('[data-uuid="b"]').classList.contains('unread')).toBe(true);
    expect(document.getElementById('statusLine').textContent).toBe('Marked 1 of 2 viewed; 1 failed');
  });

  test('all succeed', async () => {
    const popup = await setup();
    answer({
      getWatches: { success: true, data: { watches: [watch('a', { last_changed: 10, viewed: false })], fetchedAt: Date.now() } },
      markAllViewed: { success: true, data: { markedUuids: ['a'], failed: 0 } },
    });
    await popup.init();
    await popup.markAllViewed();
    expect(document.getElementById('statusLine').textContent).toBe('Marked 1 viewed');
    expect(document.getElementById('markAllBtn').disabled).toBe(true);
  });

  test('nothing unread sends nothing; failure is reported', async () => {
    const popup = await setup();
    answer({ getWatches: { success: true, data: { watches: [watch('a')], fetchedAt: Date.now() } } });
    await popup.init();
    chrome.runtime.sendMessage.mockClear();
    await popup.markAllViewed();
    expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();

    popup.watches = [watch('x', { last_changed: 5, viewed: false })];
    answer({ markAllViewed: { success: false, error: 'boom' } });
    await popup.markAllViewed();
    expect(document.getElementById('statusLine').textContent).toBe('Could not mark watches viewed: boom');
  });
});
```
2. Run `npx jest tests/popup/popup.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/popup/popup.test.js && git commit -m "test: add popup mark-all-viewed tests"`
4. In `src/popup/popup.js`, replace this exact text (it occurs exactly once):

```js
    this.el.watchesContainer.addEventListener('click', (event) => this.onListClick(event));
    this.el.watchesContainer.addEventListener('auxclick', (event) => this.onListClick(event));
  }
```

with:

```js
    this.el.watchesContainer.addEventListener('click', (event) => this.onListClick(event));
    this.el.watchesContainer.addEventListener('auxclick', (event) => this.onListClick(event));
    this.el.markAllBtn.addEventListener('click', () => this.markAllViewed());
  }
```
5. In `src/popup/popup.js`, replace this exact text (it occurs exactly once):

```js
  /** Rebuild the list from this.watches in display order. */
  render() {
    const visible = sortWatches(this.watches);
    this.el.watchesContainer.replaceChildren(
      ...visible.map((watch) => buildWatchItem(this.doc, watch, this.settings.baseURL)),
    );
    this.el.emptyMessage.hidden = visible.length > 0;
    this.el.emptyMessage.textContent = 'No watches yet.';
  }

```

with:

```js
  /** Rebuild the list from this.watches in display order. */
  render() {
    const visible = sortWatches(this.watches);
    this.el.watchesContainer.replaceChildren(
      ...visible.map((watch) => buildWatchItem(this.doc, watch, this.settings.baseURL)),
    );
    this.el.emptyMessage.hidden = visible.length > 0;
    this.el.emptyMessage.textContent = 'No watches yet.';
    this.el.markAllBtn.disabled = !this.watches.some(isUnread);
  }

```
6. In `src/popup/popup.js`, insert the following as the last method of class `PopupManager` (immediately before the class's closing `}` that precedes `document.addEventListener('DOMContentLoaded'`):

```js
  /**
   * Mark every unread watch viewed.
   *
   * @returns {Promise<void>} Resolves when the service worker answered.
   */
  async markAllViewed() {
    const unread = this.watches.filter(isUnread);
    if (unread.length === 0) return;
    this.el.markAllBtn.disabled = true;
    const items = unread.map((watch) => ({ uuid: watch.uuid, lastChanged: Number(watch.last_changed) || 0 }));
    const response = await sendMessage({ action: ACTIONS.MARK_ALL_VIEWED, items });
    if (!response.success) {
      this.setStatus(`Could not mark watches viewed: ${response.error}`);
      this.render();
      return;
    }
    const { markedUuids, failed } = response.data;
    for (const watch of this.watches) if (markedUuids.includes(watch.uuid)) watch.viewed = true;
    this.render();
    this.setStatus(
      failed > 0
        ? `Marked ${markedUuids.length} of ${items.length} viewed; ${failed} failed`
        : `Marked ${markedUuids.length} viewed`,
    );
  }
```
7. Light checks: `npm run lint` must exit 0, then `npx jest tests/popup/popup.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
8. Commit: `git add src/popup/popup.js && git commit -m "fix: mark all watches viewed in one request batch and refresh the rows"`

**Context for Implementor**
Message contract (`src/lib/messages.js` `ACTIONS`; the popup/options pages send, the service worker answers `{success: true, data?}` or `{success: false, error, errorKind?}`):
- `getWatches` `{}` → data `{watches: Watch[], fetchedAt: number}` (runs a full refresh).
- `openWatch` `{uuid, url, lastChanged, background}` → no data (opens the tab; marks viewed when `lastChanged > 0`).
- `markAllViewed` `{items: [{uuid, lastChanged}]}` → data `{markedUuids: string[], failed: number}`.
- `testConnection` `{baseURL, apiKey}` → data `{version: string, watchCount: number}` (nothing is saved).
- `addWatch` `{url}` → data `{uuid: string}`.
- `recheckAll` `{}` → data `{message: string}`.

**Acceptance Criteria**
- [ ] `npx jest tests/popup/popup.test.js` passes (16 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 211 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-29: Popup: instant render from cache
**Type:** Optimisation
**Priority:** Medium
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/popup/popup.test.js, src/popup/popup.js

**Current State**
The popup always shows a spinner until the server answers, and any refresh failure replaces the list with an error.

**Target State**
- `init()` renders `readWatchCache()` immediately when present (state `watches`), otherwise shows `loading`, then refreshes.
- `refresh()` failure while a list is on screen (and the error is not `permission`) keeps the list and sets status `Update failed: <error> (showing results from <relative>)`; permission errors always show the error state with **Grant access**.

Public surface after this task (exact names and parameters):
- `src/popup/popup.js`: method `async init()`
- `src/popup/popup.js`: method `async refresh()`

Log lines this task adds (level and exact format string, arguments as in the code below):
- WARN `Could not load watches: %s`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/popup/popup.test.js` › cached list › cached watches render before the refresh and stay on refresh failure
- `tests/popup/popup.test.js` › cached list › without a cache the loading state shows until the refresh answers
- `tests/popup/popup.test.js` › cached list › permission errors show Grant access even with a cached list

**Implementation Steps**
1. Write the tests. In `tests/popup/popup.test.js`, replace this exact text (it occurs exactly once):

```js
import { PopupManager } from '../../src/popup/popup.js';
```

with:

```js
import { writeWatchCache } from '../../src/lib/cache.js';
import { PopupManager } from '../../src/popup/popup.js';
```
2. Append the following to the end of `tests/popup/popup.test.js` (keep everything already in the file):

```js
describe('cached list', () => {
  test('cached watches render before the refresh and stay on refresh failure', async () => {
    const popup = await setup();
    await writeWatchCache([watch('cached')], Date.now() - 5 * 60 * 1000);
    let seenBeforeRefresh = null;
    answer({
      getWatches: () => {
        seenBeforeRefresh = rows();
        return { success: false, error: 'Server error (HTTP 500)', errorKind: 'http' };
      },
    });
    await popup.init();
    expect(seenBeforeRefresh).toEqual(['cached']);
    expect(visibleStates()).toEqual(['watchesList']);
    expect(document.getElementById('statusLine').textContent).toBe(
      'Update failed: Server error (HTTP 500) (showing results from 5m ago)',
    );
  });

  test('without a cache the loading state shows until the refresh answers', async () => {
    const popup = await setup();
    let statesDuringRefresh = null;
    answer({
      getWatches: () => {
        statesDuringRefresh = visibleStates();
        return { success: true, data: { watches: [], fetchedAt: Date.now() } };
      },
    });
    await popup.init();
    expect(statesDuringRefresh).toEqual(['loadingState']);
  });

  test('permission errors show Grant access even with a cached list', async () => {
    const popup = await setup();
    await writeWatchCache([watch('cached')], Date.now());
    answer({ getWatches: { success: false, error: 'Access to x is not granted', errorKind: 'permission' } });
    await popup.init();
    expect(visibleStates()).toEqual(['errorState']);
    expect(document.getElementById('grantBtn').hidden).toBe(false);
  });
});
```
3. Run `npx jest tests/popup/popup.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
4. Commit only the test files: `git add tests/popup/popup.test.js && git commit -m "test: add popup cache-first tests"`
5. In `src/popup/popup.js`, insert the following as the first import line (before `import { formatRelativeTime } from '../lib/format.js';`):

```js
import { readWatchCache } from '../lib/cache.js';
```
6. In `src/popup/popup.js`, replace this exact text (it occurs exactly once):

```js
  /**
   * Load settings, then fetch and show the watches.
   *
   * @returns {Promise<void>} Resolves when the first refresh finished.
   */
  async init() {
    this.settings = await loadSettings();
    if (!isConfigured(this.settings)) {
      this.showState('noConfig');
      return;
    }
    this.el.titleLink.href = this.settings.baseURL;
    this.showState('loading');
    await this.refresh();
  }

```

with:

```js
  /**
   * Load settings, show cached watches immediately, then refresh from the server.
   *
   * @returns {Promise<void>} Resolves when the first refresh finished.
   */
  async init() {
    this.settings = await loadSettings();
    if (!isConfigured(this.settings)) {
      this.showState('noConfig');
      return;
    }
    this.el.titleLink.href = this.settings.baseURL;
    const cache = await readWatchCache();
    if (cache) {
      this.watches = cache.watches;
      this.fetchedAt = cache.fetchedAt;
      this.render();
      this.showState('watches');
    } else {
      this.showState('loading');
    }
    await this.refresh();
  }

```
7. In `src/popup/popup.js`, replace this exact text (it occurs exactly once):

```js
  /**
   * Fetch watches through the service worker and render them.
   *
   * @returns {Promise<void>} Resolves when the list or an error is shown.
   */
  async refresh() {
    this.setStatus('Refreshing…');
    const response = await sendMessage({ action: ACTIONS.GET_WATCHES });
    if (response.success) {
      this.watches = response.data.watches;
      this.fetchedAt = response.data.fetchedAt;
      this.render();
      this.showState('watches');
      this.setStatus(`Updated ${formatRelativeTime(Math.floor(this.fetchedAt / 1000))}`);
      return;
    }
    log.warn('Could not load watches: %s', response.error);
    this.showError(response.error, response.errorKind);
  }

```

with:

```js
  /**
   * Fetch watches through the service worker and render them.
   *
   * @returns {Promise<void>} Resolves when the list or an error is shown.
   */
  async refresh() {
    this.setStatus('Refreshing…');
    const response = await sendMessage({ action: ACTIONS.GET_WATCHES });
    if (response.success) {
      this.watches = response.data.watches;
      this.fetchedAt = response.data.fetchedAt;
      this.render();
      this.showState('watches');
      this.setStatus(`Updated ${formatRelativeTime(Math.floor(this.fetchedAt / 1000))}`);
      return;
    }
    log.warn('Could not load watches: %s', response.error);
    if (response.errorKind !== 'permission' && !this.el.watchesList.hidden) {
      const age = formatRelativeTime(Math.floor(this.fetchedAt / 1000));
      this.setStatus(`Update failed: ${response.error} (showing results from ${age})`);
      return;
    }
    this.showError(response.error, response.errorKind);
  }

```
8. Light checks: `npm run lint` must exit 0, then `npx jest tests/popup/popup.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
9. Commit: `git add src/popup/popup.js && git commit -m "perf: render cached watches instantly and keep them on refresh failure"`

**Context for Implementor**
Storage keys: `chrome.storage.sync` — `baseURL` (normalized, no trailing slash), `apiKey`, `refreshInterval` (integer minutes 1–1440, default 5), `notificationsEnabled` (boolean, default false); `chrome.storage.session` — `watchCache` `{watches, fetchedAt}` and `refreshFailureCount` (number); `chrome.storage.local` — `notifiedUuids` (string[]).
- The popup reads `chrome.storage.session` directly (extension pages are trusted contexts); only the service worker writes it.

**Acceptance Criteria**
- [ ] `npx jest tests/popup/popup.test.js` passes (19 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 214 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-30: Popup: grant server access
**Type:** UX
**Priority:** High
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/popup/popup.test.js, src/popup/popup.js

**Current State**
Users upgrading from 1.0.1 have never granted host access; their first refresh fails with a `permission` error and the popup offers no way to fix it other than re-saving the options.

**Target State**
- `bindEvents()` wires **Grant access** to `grantAccess()`.
- `grantAccess()` → first statement `await requestHostPermission(this.settings.baseURL)` (keeps the user gesture); refused → status `Access not granted. The extension cannot reach your server without it.`; granted → `loading` + `refresh()`.

Public surface after this task (exact names and parameters):
- `src/popup/popup.js`: method `async grantAccess()`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/popup/popup.test.js` › grant access › granted: requests the origin and reloads
- `tests/popup/popup.test.js` › grant access › refused: explains and stays on the error

**Implementation Steps**
1. Write the tests. Append the following to the end of `tests/popup/popup.test.js` (keep everything already in the file):

```js
describe('grant access', () => {
  test('granted: requests the origin and reloads', async () => {
    const popup = await setup();
    answer({ getWatches: { success: false, error: 'Access denied', errorKind: 'permission' } });
    await popup.init();
    answer({ getWatches: { success: true, data: { watches: [watch('a')], fetchedAt: Date.now() } } });
    document.getElementById('grantBtn').click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(chrome.permissions.request).toHaveBeenCalledWith({ origins: ['http://192.168.1.10/*'] });
    expect(rows()).toEqual(['a']);
  });

  test('refused: explains and stays on the error', async () => {
    const popup = await setup();
    answer({ getWatches: { success: false, error: 'Access denied', errorKind: 'permission' } });
    await popup.init();
    chrome.permissions.request.mockResolvedValueOnce(false);
    await popup.grantAccess();
    expect(visibleStates()).toEqual(['errorState']);
    expect(document.getElementById('statusLine').textContent).toBe(
      'Access not granted. The extension cannot reach your server without it.',
    );
  });
});
```
2. Run `npx jest tests/popup/popup.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/popup/popup.test.js && git commit -m "test: add popup grant-access tests"`
4. In `src/popup/popup.js`, replace this exact text (it occurs exactly once):

```js
import { isConfigured, loadSettings } from '../lib/settings.js';
```

with:

```js
import { isConfigured, loadSettings, requestHostPermission } from '../lib/settings.js';
```
5. In `src/popup/popup.js`, replace this exact text (it occurs exactly once):

```js
    this.el.markAllBtn.addEventListener('click', () => this.markAllViewed());
  }
```

with:

```js
    this.el.markAllBtn.addEventListener('click', () => this.markAllViewed());
    this.el.grantBtn.addEventListener('click', () => this.grantAccess());
  }
```
6. In `src/popup/popup.js`, insert the following as the last method of class `PopupManager` (immediately before the class's closing `}` that precedes `document.addEventListener('DOMContentLoaded'`):

```js
  /**
   * Request host permission for the server, then retry. Called from a click handler.
   *
   * @returns {Promise<void>} Resolves when access was refused or the refresh finished.
   */
  async grantAccess() {
    const granted = await requestHostPermission(this.settings.baseURL);
    if (!granted) {
      this.setStatus('Access not granted. The extension cannot reach your server without it.');
      return;
    }
    this.showState('loading');
    await this.refresh();
  }
```
7. Light checks: `npm run lint` must exit 0, then `npx jest tests/popup/popup.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
8. Commit: `git add src/popup/popup.js && git commit -m "feat: let the popup request server access when it is missing"`

**Context for Implementor**
- Chrome shows its own prompt naming only the server's host (pattern `<protocol>//<host>/*`, any port).
- The service worker also refreshes on `permissions.onAdded`, so the badge recovers at the same time.

**Acceptance Criteria**
- [ ] `npx jest tests/popup/popup.test.js` passes (21 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 216 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-31: Popup: recheck all
**Type:** Feature
**Priority:** Low
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/popup/popup.test.js, src/popup/popup.js

**Current State**
There is no way to ask the server to recheck every watch from the browser.

**Target State**
- `bindEvents()` wires **Recheck all** to `recheckAll()`.
- `recheckAll()` → disables the button, sends `recheckAll`, re-enables it, shows the server's message (e.g. `OK, queued 3 watches for rechecking`) or `Recheck failed: <error>` in the status line.

Public surface after this task (exact names and parameters):
- `src/popup/popup.js`: method `async recheckAll()`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/popup/popup.test.js` › recheck all › shows the server message, or the failure

**Implementation Steps**
1. Write the tests. Append the following to the end of `tests/popup/popup.test.js` (keep everything already in the file):

```js
describe('recheck all', () => {
  test('shows the server message, or the failure', async () => {
    const popup = await setup();
    answer({ recheckAll: { success: true, data: { message: 'OK, queued 3 watches for rechecking' } } });
    document.getElementById('recheckAllBtn').click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ action: 'recheckAll' });
    expect(document.getElementById('statusLine').textContent).toBe('OK, queued 3 watches for rechecking');
    expect(document.getElementById('recheckAllBtn').disabled).toBe(false);
    answer({ recheckAll: { success: false, error: 'API key rejected (HTTP 403)' } });
    await popup.recheckAll();
    expect(document.getElementById('statusLine').textContent).toBe('Recheck failed: API key rejected (HTTP 403)');
  });
});
```
2. Run `npx jest tests/popup/popup.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/popup/popup.test.js && git commit -m "test: add popup recheck-all tests"`
4. In `src/popup/popup.js`, replace this exact text (it occurs exactly once):

```js
    this.el.grantBtn.addEventListener('click', () => this.grantAccess());
  }
```

with:

```js
    this.el.grantBtn.addEventListener('click', () => this.grantAccess());
    this.el.recheckAllBtn.addEventListener('click', () => this.recheckAll());
  }
```
5. In `src/popup/popup.js`, insert the following as the last method of class `PopupManager` (immediately before the class's closing `}` that precedes `document.addEventListener('DOMContentLoaded'`):

```js
  /**
   * Ask the server to recheck every watch.
   *
   * @returns {Promise<void>} Resolves when the service worker answered.
   */
  async recheckAll() {
    this.el.recheckAllBtn.disabled = true;
    const response = await sendMessage({ action: ACTIONS.RECHECK_ALL });
    this.el.recheckAllBtn.disabled = false;
    this.setStatus(response.success ? response.data.message : `Recheck failed: ${response.error}`);
  }
```
6. Light checks: `npm run lint` must exit 0, then `npx jest tests/popup/popup.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
7. Commit: `git add src/popup/popup.js && git commit -m "feat: add recheck-all button to the popup"`

**Context for Implementor**
Message contract (`src/lib/messages.js` `ACTIONS`; the popup/options pages send, the service worker answers `{success: true, data?}` or `{success: false, error, errorKind?}`):
- `getWatches` `{}` → data `{watches: Watch[], fetchedAt: number}` (runs a full refresh).
- `openWatch` `{uuid, url, lastChanged, background}` → no data (opens the tab; marks viewed when `lastChanged > 0`).
- `markAllViewed` `{items: [{uuid, lastChanged}]}` → data `{markedUuids: string[], failed: number}`.
- `testConnection` `{baseURL, apiKey}` → data `{version: string, watchCount: number}` (nothing is saved).
- `addWatch` `{url}` → data `{uuid: string}`.
- `recheckAll` `{}` → data `{message: string}`.

**Acceptance Criteria**
- [ ] `npx jest tests/popup/popup.test.js` passes (22 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 217 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-32: Popup: filter box
**Type:** Feature
**Priority:** Medium
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/popup/popup.test.js, src/popup/popup.js

**Current State**
Long watch lists can only be scrolled.

**Target State**
- `export const FILTER_MIN_WATCHES = 10;`
- `render()` shows `#filterBar` only when there are ≥ 10 watches (and clears the input when hiding it), applies `filterWatches(this.watches, input.value)` before sorting, and shows `No watches match the filter.` when the filter hides everything (`No watches yet.` when there are none).
- `bindEvents()` re-renders on `input` events of `#filterInput`. Filtering is client-side only.

Public surface after this task (exact names and parameters):
- `src/popup/popup.js`: `export const FILTER_MIN_WATCHES = 10`
- `src/popup/popup.js`: method `render()`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/popup/popup.test.js` › filter › hidden below ${FILTER_MIN_WATCHES} watches
- `tests/popup/popup.test.js` › filter › typing filters rows by title or url
- `tests/popup/popup.test.js` › filter › the filter text is cleared when the bar hides

**Implementation Steps**
1. Write the tests. In `tests/popup/popup.test.js`, replace this exact text (it occurs exactly once):

```js
import { PopupManager } from '../../src/popup/popup.js';
```

with:

```js
import { FILTER_MIN_WATCHES, PopupManager } from '../../src/popup/popup.js';
```
2. Append the following to the end of `tests/popup/popup.test.js` (keep everything already in the file):

```js
describe('filter', () => {
  test(`hidden below ${FILTER_MIN_WATCHES} watches`, async () => {
    const popup = await setup();
    answer({ getWatches: { success: true, data: { watches: [watch('a')], fetchedAt: Date.now() } } });
    await popup.init();
    expect(FILTER_MIN_WATCHES).toBe(10);
    expect(document.getElementById('filterBar').hidden).toBe(true);
  });

  test('typing filters rows by title or url', async () => {
    const popup = await setup();
    const watches = Array.from({ length: FILTER_MIN_WATCHES }, (_, i) => watch(`w${i}`));
    watches[3].title = 'Grafana release';
    answer({ getWatches: { success: true, data: { watches, fetchedAt: Date.now() } } });
    await popup.init();
    expect(document.getElementById('filterBar').hidden).toBe(false);
    const input = document.getElementById('filterInput');
    input.value = 'grafana';
    input.dispatchEvent(new Event('input'));
    expect(rows()).toEqual(['w3']);
    input.value = 'zzz';
    input.dispatchEvent(new Event('input'));
    expect(rows()).toEqual([]);
    expect(document.getElementById('emptyMessage').textContent).toBe('No watches match the filter.');
  });

  test('the filter text is cleared when the bar hides', async () => {
    const popup = await setup();
    document.getElementById('filterInput').value = 'leftover';
    answer({ getWatches: { success: true, data: { watches: [watch('a')], fetchedAt: Date.now() } } });
    await popup.init();
    expect(document.getElementById('filterInput').value).toBe('');
    expect(rows()).toEqual(['a']);
  });
});
```
3. Run `npx jest tests/popup/popup.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
4. Commit only the test files: `git add tests/popup/popup.test.js && git commit -m "test: add popup filter tests"`
5. In `src/popup/popup.js`, replace this exact text (it occurs exactly once):

```js
import { isUnread, primaryUrl, sortWatches } from '../lib/watches.js';
```

with:

```js
import { filterWatches, isUnread, primaryUrl, sortWatches } from '../lib/watches.js';
```
6. In `src/popup/popup.js`, replace this exact text (it occurs exactly once):

```js
const log = createLogger('popup');

```

with:

```js
const log = createLogger('popup');

export const FILTER_MIN_WATCHES = 10;

```
7. In `src/popup/popup.js`, replace this exact text (it occurs exactly once):

```js
    this.el.recheckAllBtn.addEventListener('click', () => this.recheckAll());
  }
```

with:

```js
    this.el.recheckAllBtn.addEventListener('click', () => this.recheckAll());
    this.el.filterInput.addEventListener('input', () => this.render());
  }
```
8. In `src/popup/popup.js`, replace this exact text (it occurs exactly once):

```js
  /** Rebuild the list from this.watches in display order. */
  render() {
    const visible = sortWatches(this.watches);
    this.el.watchesContainer.replaceChildren(
      ...visible.map((watch) => buildWatchItem(this.doc, watch, this.settings.baseURL)),
    );
    this.el.emptyMessage.hidden = visible.length > 0;
    this.el.emptyMessage.textContent = 'No watches yet.';
    this.el.markAllBtn.disabled = !this.watches.some(isUnread);
  }

```

with:

```js
  /** Rebuild the list from this.watches, applying the filter and sort order. */
  render() {
    const showFilter = this.watches.length >= FILTER_MIN_WATCHES;
    this.el.filterBar.hidden = !showFilter;
    if (!showFilter) this.el.filterInput.value = '';
    const visible = sortWatches(filterWatches(this.watches, this.el.filterInput.value));
    this.el.watchesContainer.replaceChildren(
      ...visible.map((watch) => buildWatchItem(this.doc, watch, this.settings.baseURL)),
    );
    this.el.emptyMessage.hidden = visible.length > 0;
    this.el.emptyMessage.textContent =
      this.watches.length === 0 ? 'No watches yet.' : 'No watches match the filter.';
    this.el.markAllBtn.disabled = !this.watches.some(isUnread);
  }

```
9. Light checks: `npm run lint` must exit 0, then `npx jest tests/popup/popup.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
10. Commit: `git add src/popup/popup.js && git commit -m "feat: add a filter box for long watch lists"`

**Context for Implementor**
- **Mark all viewed** still acts on every unread watch, not only the filtered ones (button label says "all").

**Acceptance Criteria**
- [ ] `npx jest tests/popup/popup.test.js` passes (25 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 220 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-33: Popup: watch this page
**Type:** Feature
**Priority:** Medium
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/popup/popup.test.js, src/popup/popup.js

**Current State**
Adding a page to changedetection.io requires switching to the server UI and pasting the URL.

**Target State**
- Constructor sets `this.pageUrl = null`; `init()` calls `initPageBar()` before the refresh; `render()` ends with `updatePageBar()`; `bindEvents()` wires **+ Watch this page** to `watchPage()`.
- `initPageBar()` → `chrome.tabs.query({active: true, currentWindow: true})`; shows `#pageBar` only for an `http(s)` URL that does not start with the server's `baseURL`.
- `updatePageBar()` → hides the button and shows `✓ This page is watched` when `findWatchByUrl` matches.
- `watchPage()` → disables the button, sends `addWatch` `{url}`, re-enables; failure → `Could not add: <error>`; success → `✓ Added` then `refresh()`.

Public surface after this task (exact names and parameters):
- `src/popup/popup.js`: method `async init()`
- `src/popup/popup.js`: method `render()`
- `src/popup/popup.js`: method `async initPageBar()`
- `src/popup/popup.js`: method `updatePageBar()`
- `src/popup/popup.js`: method `async watchPage()`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/popup/popup.test.js` › watch this page › non-http tabs and the server itself hide the bar
- `tests/popup/popup.test.js` › watch this page › an already watched page shows a note instead of the button
- `tests/popup/popup.test.js` › watch this page › adding a page sends addWatch and refreshes
- `tests/popup/popup.test.js` › watch this page › a failed add is reported and the button re-enabled

**Implementation Steps**
1. Write the tests. Append the following to the end of `tests/popup/popup.test.js` (keep everything already in the file):

```js
describe('watch this page', () => {
  test('non-http tabs and the server itself hide the bar', async () => {
    for (const url of ['chrome://extensions/', `${BASE}/diff/x`, undefined]) {
      const popup = await setup();
      chrome.tabs.query.mockResolvedValue(url ? [{ url }] : []);
      answer({ getWatches: { success: true, data: { watches: [], fetchedAt: Date.now() } } });
      await popup.init();
      expect(document.getElementById('pageBar').hidden).toBe(true);
    }
  });

  test('an already watched page shows a note instead of the button', async () => {
    const popup = await setup();
    chrome.tabs.query.mockResolvedValue([{ url: 'https://a.example/#top' }]);
    answer({ getWatches: { success: true, data: { watches: [watch('a')], fetchedAt: Date.now() } } });
    await popup.init();
    expect(chrome.tabs.query).toHaveBeenCalledWith({ active: true, currentWindow: true });
    expect(document.getElementById('pageBar').hidden).toBe(false);
    expect(document.getElementById('watchPageBtn').hidden).toBe(true);
    expect(document.getElementById('pageStatus').textContent).toBe('✓ This page is watched');
  });

  test('adding a page sends addWatch and refreshes', async () => {
    const popup = await setup();
    chrome.tabs.query.mockResolvedValue([{ url: 'https://new.example/page' }]);
    const lists = [[], [watch('n', { url: 'https://new.example/page' })]];
    answer({
      getWatches: () => ({ success: true, data: { watches: lists.shift(), fetchedAt: Date.now() } }),
      addWatch: { success: true, data: { uuid: 'n' } },
    });
    await popup.init();
    expect(document.getElementById('watchPageBtn').hidden).toBe(false);
    document.getElementById('watchPageBtn').click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ action: 'addWatch', url: 'https://new.example/page' });
    expect(rows()).toEqual(['n']);
    expect(document.getElementById('watchPageBtn').hidden).toBe(true);
    expect(document.getElementById('pageStatus').textContent).toBe('✓ This page is watched');
  });

  test('a failed add is reported and the button re-enabled', async () => {
    const popup = await setup();
    chrome.tabs.query.mockResolvedValue([{ url: 'https://new.example/page' }]);
    answer({
      getWatches: { success: true, data: { watches: [], fetchedAt: Date.now() } },
      addWatch: { success: false, error: 'Server error (HTTP 400)' },
    });
    await popup.init();
    await popup.watchPage();
    expect(document.getElementById('pageStatus').textContent).toBe('Could not add: Server error (HTTP 400)');
    expect(document.getElementById('watchPageBtn').disabled).toBe(false);
  });
});
```
2. Run `npx jest tests/popup/popup.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/popup/popup.test.js && git commit -m "test: add popup watch-this-page tests"`
4. In `src/popup/popup.js`, replace this exact text (it occurs exactly once):

```js
import { filterWatches, isUnread, primaryUrl, sortWatches } from '../lib/watches.js';
```

with:

```js
import { filterWatches, findWatchByUrl, isUnread, primaryUrl, sortWatches } from '../lib/watches.js';
```
5. In `src/popup/popup.js`, replace this exact text (it occurs exactly once):

```js
    this.fetchedAt = 0;
    this.bindEvents();
```

with:

```js
    this.fetchedAt = 0;
    this.pageUrl = null;
    this.bindEvents();
```
6. In `src/popup/popup.js`, replace this exact text (it occurs exactly once):

```js
    this.el.filterInput.addEventListener('input', () => this.render());
  }
```

with:

```js
    this.el.filterInput.addEventListener('input', () => this.render());
    this.el.watchPageBtn.addEventListener('click', () => this.watchPage());
  }
```
7. In `src/popup/popup.js`, replace this exact text (it occurs exactly once):

```js
  /**
   * Load settings, show cached watches immediately, then refresh from the server.
   *
   * @returns {Promise<void>} Resolves when the first refresh finished.
   */
  async init() {
    this.settings = await loadSettings();
    if (!isConfigured(this.settings)) {
      this.showState('noConfig');
      return;
    }
    this.el.titleLink.href = this.settings.baseURL;
    const cache = await readWatchCache();
    if (cache) {
      this.watches = cache.watches;
      this.fetchedAt = cache.fetchedAt;
      this.render();
      this.showState('watches');
    } else {
      this.showState('loading');
    }
    await this.refresh();
  }

```

with:

```js
  /**
   * Load settings, show cached watches immediately, then refresh from the server.
   *
   * @returns {Promise<void>} Resolves when the first refresh finished.
   */
  async init() {
    this.settings = await loadSettings();
    if (!isConfigured(this.settings)) {
      this.showState('noConfig');
      return;
    }
    this.el.titleLink.href = this.settings.baseURL;
    const cache = await readWatchCache();
    if (cache) {
      this.watches = cache.watches;
      this.fetchedAt = cache.fetchedAt;
      this.render();
      this.showState('watches');
    } else {
      this.showState('loading');
    }
    await this.initPageBar();
    await this.refresh();
  }

```
8. In `src/popup/popup.js`, replace this exact text (it occurs exactly once):

```js
  /** Rebuild the list from this.watches, applying the filter and sort order. */
  render() {
    const showFilter = this.watches.length >= FILTER_MIN_WATCHES;
    this.el.filterBar.hidden = !showFilter;
    if (!showFilter) this.el.filterInput.value = '';
    const visible = sortWatches(filterWatches(this.watches, this.el.filterInput.value));
    this.el.watchesContainer.replaceChildren(
      ...visible.map((watch) => buildWatchItem(this.doc, watch, this.settings.baseURL)),
    );
    this.el.emptyMessage.hidden = visible.length > 0;
    this.el.emptyMessage.textContent =
      this.watches.length === 0 ? 'No watches yet.' : 'No watches match the filter.';
    this.el.markAllBtn.disabled = !this.watches.some(isUnread);
  }

```

with:

```js
  /** Rebuild the list from this.watches, applying the filter and sort order. */
  render() {
    const showFilter = this.watches.length >= FILTER_MIN_WATCHES;
    this.el.filterBar.hidden = !showFilter;
    if (!showFilter) this.el.filterInput.value = '';
    const visible = sortWatches(filterWatches(this.watches, this.el.filterInput.value));
    this.el.watchesContainer.replaceChildren(
      ...visible.map((watch) => buildWatchItem(this.doc, watch, this.settings.baseURL)),
    );
    this.el.emptyMessage.hidden = visible.length > 0;
    this.el.emptyMessage.textContent =
      this.watches.length === 0 ? 'No watches yet.' : 'No watches match the filter.';
    this.el.markAllBtn.disabled = !this.watches.some(isUnread);
    this.updatePageBar();
  }

```
9. In `src/popup/popup.js`, insert the following as the last methods of class `PopupManager` (immediately before the class's closing `}` that precedes `document.addEventListener('DOMContentLoaded'`):

```js
  /**
   * Show "Watch this page" when the active tab is an http(s) page outside the server UI.
   *
   * @returns {Promise<void>} Resolves when the bar is set up.
   */
  async initPageBar() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab?.url;
    if (!url || !/^https?:\/\//i.test(url) || url.startsWith(this.settings.baseURL)) return;
    this.pageUrl = url;
    this.el.pageBar.hidden = false;
    this.updatePageBar();
  }

  /** Toggle between the "Watch this page" button and the "already watched" note. */
  updatePageBar() {
    if (!this.pageUrl) return;
    const watched = Boolean(findWatchByUrl(this.watches, this.pageUrl));
    this.el.watchPageBtn.hidden = watched;
    if (watched) this.el.pageStatus.textContent = '✓ This page is watched';
  }

  /**
   * Create a watch for the active tab, then refresh the list.
   *
   * @returns {Promise<void>} Resolves when the watch was added and the list refreshed, or on failure.
   */
  async watchPage() {
    this.el.watchPageBtn.disabled = true;
    const response = await sendMessage({ action: ACTIONS.ADD_WATCH, url: this.pageUrl });
    this.el.watchPageBtn.disabled = false;
    if (!response.success) {
      this.el.pageStatus.textContent = `Could not add: ${response.error}`;
      return;
    }
    this.el.pageStatus.textContent = '✓ Added';
    await this.refresh();
  }
```
10. Light checks: `npm run lint` must exit 0, then `npx jest tests/popup/popup.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
11. Commit: `git add src/popup/popup.js && git commit -m "feat: add "Watch this page" to the popup"`

**Context for Implementor**
Message contract (`src/lib/messages.js` `ACTIONS`; the popup/options pages send, the service worker answers `{success: true, data?}` or `{success: false, error, errorKind?}`):
- `getWatches` `{}` → data `{watches: Watch[], fetchedAt: number}` (runs a full refresh).
- `openWatch` `{uuid, url, lastChanged, background}` → no data (opens the tab; marks viewed when `lastChanged > 0`).
- `markAllViewed` `{items: [{uuid, lastChanged}]}` → data `{markedUuids: string[], failed: number}`.
- `testConnection` `{baseURL, apiKey}` → data `{version: string, watchCount: number}` (nothing is saved).
- `addWatch` `{url}` → data `{uuid: string}`.
- `recheckAll` `{}` → data `{message: string}`.
- `activeTab` (manifest) makes the active tab's `url` readable while the popup is open — no `tabs` permission.

**Acceptance Criteria**
- [ ] `npx jest tests/popup/popup.test.js` passes (29 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 224 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-34: Options markup and styles
**Type:** UX
**Priority:** Medium
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/options/options-markup.test.js, src/options/options.html, src/options/options.css

**Current State**
`options.html` has separate test/save result boxes toggled with inline styles and auto-hidden after 5 s (messages vanish before they are read), no notifications setting, verbose setup text that says to "enable the API" (no such toggle in current changedetection.io), and a classic script tag. `options.css` has fixed light colours and styles for elements that do not exist.

**Target State**
`src/options/options.html` and `src/options/options.css` replaced as given: labelled fields `baseURL` (url), `apiKey` (password), `refreshInterval` (number 1–1440, default 5), `notificationsEnabled` (checkbox); **Test connection** (`type=button`) and **Save** (`type=submit`); one `#message` (`role=status`, `aria-live=polite`, hidden); a three-step setup list and the note `Requires changedetection.io 0.50.12 or newer.`; `<script type="module" src="options.js">`. CSS: custom properties with dark palette, `:focus-visible`, `.message-success/-error/-info`.

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/options/options-markup.test.js` › options.html › contains every element the options script uses
- `tests/options/options-markup.test.js` › options.html › has labelled fields with the expected types and limits
- `tests/options/options-markup.test.js` › options.html › has a hidden live message and loads options.js as a module
- `tests/options/options-markup.test.js` › options.css › lets the hidden attribute win and styles every message type
- `tests/options/options-markup.test.js` › options.css › has a dark theme and focus rings

**Implementation Steps**
1. Write the tests. Create `tests/options/options-markup.test.js` with exactly this content:

```js
import fs from 'node:fs';
import path from 'node:path';
import { loadHtml } from '../helpers/dom.js';

describe('options.html', () => {
  beforeEach(() => loadHtml('src/options/options.html'));

  test('contains every element the options script uses', () => {
    for (const id of ['settingsForm', 'baseURL', 'apiKey', 'refreshInterval', 'notificationsEnabled', 'testBtn', 'saveBtn', 'message', 'versionNumber']) {
      expect(document.getElementById(id)).not.toBeNull();
    }
  });

  test('has labelled fields with the expected types and limits', () => {
    expect(document.querySelector('label[for="baseURL"]').textContent).toBe('Server URL');
    expect(document.querySelector('label[for="apiKey"]').textContent).toBe('API key');
    expect(document.getElementById('apiKey').type).toBe('password');
    const interval = document.getElementById('refreshInterval');
    expect([interval.type, interval.min, interval.max, interval.value]).toEqual(['number', '1', '1440', '5']);
    expect(document.getElementById('notificationsEnabled').type).toBe('checkbox');
    expect(document.getElementById('saveBtn').type).toBe('submit');
    expect(document.getElementById('testBtn').type).toBe('button');
  });

  test('has a hidden live message and loads options.js as a module', () => {
    const message = document.getElementById('message');
    expect(message.hidden).toBe(true);
    expect(message.getAttribute('aria-live')).toBe('polite');
    expect(document.querySelector('script[type="module"][src="options.js"]')).not.toBeNull();
    expect(document.body.textContent).toContain('Requires changedetection.io 0.50.12 or newer.');
  });
});

describe('options.css', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', '..', 'src/options/options.css'), 'utf8');

  test('lets the hidden attribute win and styles every message type', () => {
    expect(css).toContain('[hidden] {\n  display: none !important;\n}');
    for (const type of ['success', 'error', 'info']) expect(css).toContain(`.message-${type} {`);
  });

  test('has a dark theme and focus rings', () => {
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain(':focus-visible');
  });
});
```
2. Run `npx jest tests/options/options-markup.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/options/options-markup.test.js && git commit -m "test: pin options markup and theme rules"`
4. Replace the entire content of `src/options/options.html` with exactly:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ChangeDetection.io Monitor — Settings</title>
  <link rel="stylesheet" href="options.css">
</head>
<body>
  <main class="page">
    <header class="page-header">
      <h1>ChangeDetection.io Monitor</h1>
      <p id="versionNumber" class="version"></p>
    </header>

    <form id="settingsForm" novalidate>
      <div class="field">
        <label for="baseURL">Server URL</label>
        <input id="baseURL" name="baseURL" type="url" placeholder="http://192.168.1.10:5000" autocomplete="url" required>
        <small>The address you open changedetection.io at.</small>
      </div>
      <div class="field">
        <label for="apiKey">API key</label>
        <input id="apiKey" name="apiKey" type="password" autocomplete="off" required>
        <small>In changedetection.io: Settings → API.</small>
      </div>
      <div class="field">
        <label for="refreshInterval">Refresh every (minutes)</label>
        <input id="refreshInterval" name="refreshInterval" type="number" min="1" max="1440" step="1" value="5" required>
      </div>
      <div class="field field-check">
        <input id="notificationsEnabled" name="notificationsEnabled" type="checkbox">
        <label for="notificationsEnabled">Show a desktop notification when a watch changes</label>
      </div>
      <div class="actions">
        <button id="testBtn" class="btn" type="button">Test connection</button>
        <button id="saveBtn" class="btn btn-primary" type="submit">Save</button>
      </div>
      <p id="message" class="message" role="status" aria-live="polite" hidden></p>
    </form>

    <section class="help">
      <h2>Setup</h2>
      <ol>
        <li>In changedetection.io, open <strong>Settings → API</strong> and copy the API key.</li>
        <li>Enter the server URL and API key, then click <strong>Test connection</strong>.</li>
        <li>Click <strong>Save</strong>. Chrome asks once for access to your server.</li>
      </ol>
      <p>Requires changedetection.io 0.50.12 or newer.</p>
    </section>
  </main>

  <script type="module" src="options.js"></script>
</body>
</html>
```
5. Replace the entire content of `src/options/options.css` with exactly:

```css
:root {
  color-scheme: light dark;
  --bg: #f6f7fb;
  --surface: #ffffff;
  --text: #1f2330;
  --muted: #5f6675;
  --border: #dde1ea;
  --accent: #5a67d8;
  --accent-hover: #4c56c0;
  --accent-contrast: #ffffff;
  --focus: #7c8cff;
  --success-bg: #e6f4ea;
  --success-text: #1e6b34;
  --error-bg: #fce8e6;
  --error-text: #a50e0e;
  --info-bg: #e8f0fe;
  --info-text: #1a4fa0;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #15171e;
    --surface: #1f222b;
    --text: #e7e9ef;
    --muted: #a3a9b7;
    --border: #323644;
    --accent: #7f8cff;
    --accent-hover: #95a0ff;
    --accent-contrast: #0f1117;
    --focus: #a5b0ff;
    --success-bg: #1d3526;
    --success-text: #8fdca5;
    --error-bg: #3d1f1f;
    --error-text: #ffaaa3;
    --info-bg: #1c2a44;
    --info-text: #a9c5ff;
  }
}

[hidden] {
  display: none !important;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font: 15px/1.5 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}

.page {
  max-width: 640px;
  margin: 0 auto;
  padding: 32px 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
}

.version {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 13px;
}

form {
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;
}

.field label {
  font-weight: 600;
}

.field input[type='url'],
.field input[type='password'],
.field input[type='number'] {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  font: inherit;
}

.field input:focus {
  border-color: var(--accent);
}

.field small {
  color: var(--muted);
  font-size: 13px;
}

.field-check {
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.field-check label {
  font-weight: 400;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 18px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.btn:hover:not(:disabled) {
  border-color: var(--accent);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-primary {
  flex: 1;
  border-color: var(--accent);
  background: var(--accent);
  color: var(--accent-contrast);
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-hover);
}

.message {
  margin: 16px 0 0;
  padding: 10px 12px;
  border-radius: 6px;
  overflow-wrap: anywhere;
}

.message-success {
  background: var(--success-bg);
  color: var(--success-text);
}

.message-error {
  background: var(--error-bg);
  color: var(--error-text);
}

.message-info {
  background: var(--info-bg);
  color: var(--info-text);
}

.help {
  margin-top: 32px;
  color: var(--muted);
}

.help h2 {
  color: var(--text);
  font-size: 16px;
}

.help ol {
  padding-left: 20px;
}
```
6. Light checks: `npm run lint` must exit 0, then `npx jest tests/options/options-markup.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
7. Commit: `git add src/options/options.html src/options/options.css && git commit -m "feat: accessible dark-mode options page markup"`

**Context for Implementor**
- Element ids are the contract with `options.js` (next tasks): `settingsForm, baseURL, apiKey, refreshInterval, notificationsEnabled, testBtn, saveBtn, message, versionNumber`.
- The legacy `options.js` will not work with this markup; it is replaced by the next task — do not edit it here.

**Acceptance Criteria**
- [ ] `npx jest tests/options/options-markup.test.js` passes (5 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 229 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-35: Options controller core rewrite
**Type:** Bug Fix
**Priority:** High
**Effort:** Medium (1–2 h)
**Tier:** Haiku
**Files:** tests/options/options.test.js, src/options/options.js, eslint.config.mjs

**Current State**
Legacy `src/options/options.js` stores the URL unnormalised, accepts `javascript:` URLs, never requests host access (so LAN servers can be blocked), auto-hides messages after 5 s, and cannot be imported by tests.

**Target State**
`src/options/options.js` replaced by an ES module exporting `class OptionsManager` (constructor `(doc = document)`) with `bindEvents()` (submit → `save()`; any `input` → `hideMessage()`), `init()` (`Version <manifest version>`, fills all four fields from `loadSettings()`), `readForm()` (`refreshInterval` via `Number()`), `save()` (validate → on error show it and stop; `await requestHostPermission(value.baseURL)` as the first await; refused → error `Chrome needs access to <baseURL> to reach your server.` + WARN; granted → `chrome.storage.sync.set({...value, notificationsEnabled})`, write normalised values back into the inputs, success `Settings saved.`, INFO log without the key), `showMessage(type, text)` (`message message-<type>`), `hideMessage()`; bootstrap logging `Options page failed to start: %s`. `LEGACY_FILES` in `eslint.config.mjs` becomes `[]`.

Public surface after this task (exact names and parameters):
- `src/options/options.js`: `export class OptionsManager`
- `src/options/options.js`: method `constructor(doc = document)`
- `src/options/options.js`: method `bindEvents()`
- `src/options/options.js`: method `async init()`
- `src/options/options.js`: method `readForm()`
- `src/options/options.js`: method `async save()`
- `src/options/options.js`: method `showMessage(type, text)`
- `src/options/options.js`: method `hideMessage()`

Log lines this task adds (level and exact format string, arguments as in the code below):
- WARN `Settings not saved: access to %s was refused`
- INFO `Settings saved: server %s, refresh every %d min`
- ERROR `Options page failed to start: %s`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/options/options.test.js` › init › shows the version and fills saved settings
- `tests/options/options.test.js` › save › validates first and shows the error without asking permission
- `tests/options/options.test.js` › save › requests host permission, stores normalized values and logs without the key
- `tests/options/options.test.js` › save › refused permission does not save
- `tests/options/options.test.js` › save › submitting the form saves
- `tests/options/options.test.js` › save › typing hides the message
- `tests/options/options.test.js` › bootstrap › DOMContentLoaded fills the form
- `tests/options/options.test.js` › bootstrap › start-up failures are logged

**Implementation Steps**
1. Write the tests. Create `tests/options/options.test.js` with exactly this content:

```js
import { OptionsManager } from '../../src/options/options.js';
import { loadHtml } from '../helpers/dom.js';
import { allLogText, hasLog } from '../helpers/logs.js';

const BASE = 'http://192.168.1.10:5000';

/**
 * Load options.html and create the manager.
 *
 * @returns {OptionsManager} Manager (not yet initialised).
 */
function setup() {
  loadHtml('src/options/options.html');
  return new OptionsManager(document);
}

/**
 * Fill the form fields.
 *
 * @param {{baseURL?: string, apiKey?: string, refreshInterval?: string}} values - Field values.
 */
function fill({ baseURL = BASE, apiKey = 'key', refreshInterval = '5' } = {}) {
  document.getElementById('baseURL').value = baseURL;
  document.getElementById('apiKey').value = apiKey;
  document.getElementById('refreshInterval').value = refreshInterval;
}

/**
 * Current message element state.
 *
 * @returns {{hidden: boolean, className: string, text: string}} Message state.
 */
function message() {
  const el = document.getElementById('message');
  return { hidden: el.hidden, className: el.className, text: el.textContent };
}

describe('init', () => {
  test('shows the version and fills saved settings', async () => {
    await chrome.storage.sync.set({ baseURL: `${BASE}/`, apiKey: 'k', refreshInterval: 15, notificationsEnabled: true });
    await setup().init();
    expect(document.getElementById('versionNumber').textContent).toBe('Version 0.0.0-test');
    expect(document.getElementById('baseURL').value).toBe(BASE);
    expect(document.getElementById('apiKey').value).toBe('k');
    expect(document.getElementById('refreshInterval').value).toBe('15');
    expect(document.getElementById('notificationsEnabled').checked).toBe(true);
  });
});

describe('save', () => {
  test('validates first and shows the error without asking permission', async () => {
    const options = setup();
    fill({ baseURL: 'not a url' });
    await options.save();
    expect(message()).toEqual({
      hidden: false,
      className: 'message message-error',
      text: 'Enter a valid http:// or https:// URL, e.g. http://192.168.1.10:5000',
    });
    expect(chrome.permissions.request).not.toHaveBeenCalled();
    expect(chrome.storage.sync.set).not.toHaveBeenCalled();
  });

  test('requests host permission, stores normalized values and logs without the key', async () => {
    const options = setup();
    fill({ baseURL: `${BASE}/api/v1/watch`, apiKey: ' secret-key ', refreshInterval: '10' });
    await options.save();
    expect(chrome.permissions.request).toHaveBeenCalledWith({ origins: ['http://192.168.1.10/*'] });
    expect(await chrome.storage.sync.get(null)).toEqual({
      baseURL: BASE, apiKey: 'secret-key', refreshInterval: 10, notificationsEnabled: false,
    });
    expect(document.getElementById('baseURL').value).toBe(BASE);
    expect(document.getElementById('apiKey').value).toBe('secret-key');
    expect(message()).toEqual({ hidden: false, className: 'message message-success', text: 'Settings saved.' });
    expect(hasLog('info', `[cdio:options] Settings saved: server ${BASE}, refresh every 10 min`)).toBe(true);
    expect(allLogText()).not.toContain('secret-key');
  });

  test('refused permission does not save', async () => {
    const options = setup();
    fill();
    chrome.permissions.request.mockResolvedValueOnce(false);
    await options.save();
    expect(chrome.storage.sync.set).not.toHaveBeenCalled();
    expect(message().text).toBe(`Chrome needs access to ${BASE} to reach your server.`);
    expect(hasLog('warn', `Settings not saved: access to ${BASE} was refused`)).toBe(true);
  });

  test('submitting the form saves', async () => {
    setup();
    fill();
    document.getElementById('settingsForm').dispatchEvent(new Event('submit', { cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(chrome.storage.sync.set).toHaveBeenCalled();
  });

  test('typing hides the message', () => {
    const options = setup();
    options.showMessage('success', 'x');
    document.getElementById('baseURL').dispatchEvent(new Event('input', { bubbles: true }));
    expect(message().hidden).toBe(true);
  });
});

describe('bootstrap', () => {
  test('DOMContentLoaded fills the form', async () => {
    loadHtml('src/options/options.html');
    await chrome.storage.sync.set({ baseURL: BASE, apiKey: 'k' });
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.getElementById('baseURL').value).toBe(BASE);
  });

  test('start-up failures are logged', async () => {
    loadHtml('src/options/options.html');
    chrome.storage.sync.get.mockRejectedValueOnce(new Error('storage down'));
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(hasLog('error', '[cdio:options] Options page failed to start: storage down')).toBe(true);
  });
});
```
2. Run `npx jest tests/options/options.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/options/options.test.js && git commit -m "test: add options controller tests"`
4. Replace the entire content of `src/options/options.js` with exactly:

```js
/**
 * @file Options page controller for the extension settings (server URL, API key, refresh
 * interval, notifications).
 *
 * Saving and testing first ask Chrome for access to the server origin (optional host
 * permission) from inside the click, which Chrome requires before the service worker can
 * reach servers on the local network.
 */
import { createLogger } from '../lib/log.js';
import { loadSettings, requestHostPermission, validateSettings } from '../lib/settings.js';

const log = createLogger('options');

/** Controller for options.html. */
export class OptionsManager {
  /**
   * Look up the form elements and wire their events.
   *
   * @param {Document} [doc] - Document holding options.html; defaults to the global document.
   */
  constructor(doc = document) {
    this.form = doc.getElementById('settingsForm');
    this.baseURLInput = doc.getElementById('baseURL');
    this.apiKeyInput = doc.getElementById('apiKey');
    this.refreshIntervalInput = doc.getElementById('refreshInterval');
    this.notificationsInput = doc.getElementById('notificationsEnabled');
    this.testBtn = doc.getElementById('testBtn');
    this.message = doc.getElementById('message');
    this.versionNumber = doc.getElementById('versionNumber');
    this.bindEvents();
  }

  /** Attach the form's event listeners. */
  bindEvents() {
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.save();
    });
    this.form.addEventListener('input', () => this.hideMessage());
  }

  /**
   * Show the version and fill the form with saved settings.
   *
   * @returns {Promise<void>} Resolves when the form is filled.
   */
  async init() {
    this.versionNumber.textContent = `Version ${chrome.runtime.getManifest().version}`;
    const settings = await loadSettings();
    this.baseURLInput.value = settings.baseURL;
    this.apiKeyInput.value = settings.apiKey;
    this.refreshIntervalInput.value = String(settings.refreshInterval);
    this.notificationsInput.checked = settings.notificationsEnabled;
  }

  /**
   * Read the current form values.
   *
   * @returns {{baseURL: string, apiKey: string, refreshInterval: number}} Raw values; refreshInterval converted with Number().
   */
  readForm() {
    return {
      baseURL: this.baseURLInput.value,
      apiKey: this.apiKeyInput.value,
      refreshInterval: Number(this.refreshIntervalInput.value),
    };
  }

  /**
   * Validate, request server access, then save. Called from the submit handler.
   *
   * @returns {Promise<void>} Resolves when saved or when an error is shown.
   */
  async save() {
    const check = validateSettings(this.readForm());
    if (!check.ok) {
      this.showMessage('error', check.error);
      return;
    }
    const granted = await requestHostPermission(check.value.baseURL);
    if (!granted) {
      this.showMessage('error', `Chrome needs access to ${check.value.baseURL} to reach your server.`);
      log.warn('Settings not saved: access to %s was refused', check.value.baseURL);
      return;
    }
    await chrome.storage.sync.set({ ...check.value, notificationsEnabled: this.notificationsInput.checked });
    this.baseURLInput.value = check.value.baseURL;
    this.apiKeyInput.value = check.value.apiKey;
    this.showMessage('success', 'Settings saved.');
    log.info('Settings saved: server %s, refresh every %d min', check.value.baseURL, check.value.refreshInterval);
  }

  /**
   * Show the status message.
   *
   * @param {'success'|'error'|'info'} type - Message style.
   * @param {string} text - Message text.
   */
  showMessage(type, text) {
    this.message.className = `message message-${type}`;
    this.message.textContent = text;
    this.message.hidden = false;
  }

  /** Hide the status message. */
  hideMessage() {
    this.message.hidden = true;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new OptionsManager().init().catch((error) => log.error('Options page failed to start: %s', error.message));
});
```
5. In `eslint.config.mjs`, replace this exact text (it occurs exactly once):

```js
const LEGACY_FILES = ['src/options/options.js'];
```

with:

```js
const LEGACY_FILES = [];
```
6. Light checks: `npm run lint` must exit 0, then `npx jest tests/options/options.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
7. Commit: `git add src/options/options.js eslint.config.mjs && git commit -m "fix: validate, normalise and request server access when saving settings"`

**Context for Implementor**
Storage keys: `chrome.storage.sync` — `baseURL` (normalized, no trailing slash), `apiKey`, `refreshInterval` (integer minutes 1–1440, default 5), `notificationsEnabled` (boolean, default false); `chrome.storage.session` — `watchCache` `{watches, fetchedAt}` and `refreshFailureCount` (number); `chrome.storage.local` — `notifiedUuids` (string[]).
- The service worker reacts to the saved keys via `chrome.storage.onChanged` (reschedule / refresh) — the page sends no message on save.
- `save()` is called synchronously from the submit handler and nothing is awaited before `requestHostPermission`, so Chrome sees the user gesture.
- Logging: only through `createLogger(scope)` from `src/lib/log.js` (ESLint `no-console` rejects `console.*` elsewhere). Lines start `[cdio:<scope>]`, use `%s`/`%d` placeholders, never include the API key.

**Acceptance Criteria**
- [ ] `npx jest tests/options/options.test.js` passes (8 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 237 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-36: Options: test connection without saving
**Type:** Bug Fix
**Priority:** High
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/options/options.test.js, src/options/options.js

**Current State**
After the core rewrite, **Test connection** does nothing yet; the legacy version saved the typed credentials before testing.

**Target State**
- Imports `ACTIONS, sendMessage` and `validateConnection`; `bindEvents()` wires `#testBtn`.
- `testConnection()` → `validateConnection(readForm())` (refresh interval ignored); error → message; `await requestHostPermission(baseURL)` first; refused → `Chrome needs access to <baseURL> to reach your server.`; else disable the button, info `Testing connection…`, send `testConnection` `{baseURL, apiKey}`, re-enable; success `Connected: changedetection.io <version>, <N> watches.`; failure `Connection failed: <error>`. Nothing is written to storage.

Public surface after this task (exact names and parameters):
- `src/options/options.js`: method `async testConnection()`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/options/options.test.js` › test connection › tests the unsaved values through the service worker without storing them
- `tests/options/options.test.js` › test connection › ignores the refresh interval
- `tests/options/options.test.js` › test connection › shows validation, permission and server failures

**Implementation Steps**
1. Write the tests. Append the following to the end of `tests/options/options.test.js` (keep everything already in the file):

```js
describe('test connection', () => {
  test('tests the unsaved values through the service worker without storing them', async () => {
    const options = setup();
    fill({ baseURL: `${BASE}/`, apiKey: 'k2' });
    chrome.runtime.sendMessage.mockResolvedValueOnce({ success: true, data: { version: '0.50.12', watchCount: 7 } });
    await options.testConnection();
    expect(chrome.permissions.request).toHaveBeenCalledWith({ origins: ['http://192.168.1.10/*'] });
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ action: 'testConnection', baseURL: BASE, apiKey: 'k2' });
    expect(chrome.storage.sync.set).not.toHaveBeenCalled();
    expect(message()).toEqual({
      hidden: false,
      className: 'message message-success',
      text: 'Connected: changedetection.io 0.50.12, 7 watches.',
    });
    expect(document.getElementById('testBtn').disabled).toBe(false);
  });

  test('ignores the refresh interval', async () => {
    const options = setup();
    fill({ refreshInterval: '0' });
    chrome.runtime.sendMessage.mockResolvedValueOnce({ success: true, data: { version: '1', watchCount: 0 } });
    await options.testConnection();
    expect(message().className).toBe('message message-success');
  });

  test('shows validation, permission and server failures', async () => {
    const options = setup();
    fill({ apiKey: ' ' });
    await options.testConnection();
    expect(message().text).toBe('Enter your API key.');

    fill();
    chrome.permissions.request.mockResolvedValueOnce(false);
    await options.testConnection();
    expect(message().text).toBe(`Chrome needs access to ${BASE} to reach your server.`);
    expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();

    chrome.runtime.sendMessage.mockResolvedValueOnce({ success: false, error: 'API key rejected (HTTP 403)' });
    document.getElementById('testBtn').click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(message()).toEqual({
      hidden: false,
      className: 'message message-error',
      text: 'Connection failed: API key rejected (HTTP 403)',
    });
  });
});
```
2. Run `npx jest tests/options/options.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/options/options.test.js && git commit -m "test: add options test-connection tests"`
4. In `src/options/options.js`, replace this exact text (it occurs exactly once):

```js
import { createLogger } from '../lib/log.js';
```

with:

```js
import { createLogger } from '../lib/log.js';
import { ACTIONS, sendMessage } from '../lib/messages.js';
```
5. In `src/options/options.js`, replace this exact text (it occurs exactly once):

```js
import { loadSettings, requestHostPermission, validateSettings } from '../lib/settings.js';
```

with:

```js
import { loadSettings, requestHostPermission, validateConnection, validateSettings } from '../lib/settings.js';
```
6. In `src/options/options.js`, replace this exact text (it occurs exactly once):

```js
    this.form.addEventListener('input', () => this.hideMessage());
  }
```

with:

```js
    this.form.addEventListener('input', () => this.hideMessage());
    this.testBtn.addEventListener('click', () => this.testConnection());
  }
```
7. In `src/options/options.js`, insert the following as the last method of class `OptionsManager` (immediately before the class's closing `}` that precedes `document.addEventListener('DOMContentLoaded'`):

```js
  /**
   * Test the typed server URL and API key without saving them. Called from a click handler.
   *
   * @returns {Promise<void>} Resolves when the result is shown.
   */
  async testConnection() {
    const check = validateConnection(this.readForm());
    if (!check.ok) {
      this.showMessage('error', check.error);
      return;
    }
    const granted = await requestHostPermission(check.value.baseURL);
    if (!granted) {
      this.showMessage('error', `Chrome needs access to ${check.value.baseURL} to reach your server.`);
      return;
    }
    this.testBtn.disabled = true;
    this.showMessage('info', 'Testing connection…');
    const response = await sendMessage({ action: ACTIONS.TEST_CONNECTION, ...check.value });
    this.testBtn.disabled = false;
    if (response.success) {
      const { version, watchCount } = response.data;
      this.showMessage('success', `Connected: changedetection.io ${version}, ${watchCount} watches.`);
    } else {
      this.showMessage('error', `Connection failed: ${response.error}`);
    }
  }
```
8. Light checks: `npm run lint` must exit 0, then `npx jest tests/options/options.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
9. Commit: `git add src/options/options.js && git commit -m "fix: test the typed connection through the service worker without saving"`

**Context for Implementor**
Message contract (`src/lib/messages.js` `ACTIONS`; the popup/options pages send, the service worker answers `{success: true, data?}` or `{success: false, error, errorKind?}`):
- `getWatches` `{}` → data `{watches: Watch[], fetchedAt: number}` (runs a full refresh).
- `openWatch` `{uuid, url, lastChanged, background}` → no data (opens the tab; marks viewed when `lastChanged > 0`).
- `markAllViewed` `{items: [{uuid, lastChanged}]}` → data `{markedUuids: string[], failed: number}`.
- `testConnection` `{baseURL, apiKey}` → data `{version: string, watchCount: number}` (nothing is saved).
- `addWatch` `{url}` → data `{uuid: string}`.
- `recheckAll` `{}` → data `{message: string}`.

**Acceptance Criteria**
- [ ] `npx jest tests/options/options.test.js` passes (11 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 240 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-37: Options: notifications opt-in
**Type:** Feature
**Priority:** Medium
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** tests/options/options.test.js, src/options/options.js

**Current State**
The notifications checkbox is saved but ticking it does not ask Chrome for the `notifications` permission, so notifications would silently never show.

**Target State**
- `bindEvents()` listens to `change` on `#notificationsEnabled`.
- `onNotificationsToggle()` → when ticked, `await chrome.permissions.request({permissions: ['notifications']})` as the first await; refused → untick and show `Chrome did not allow notifications.`. Unticking does not prompt. The flag is saved by **Save**.

Public surface after this task (exact names and parameters):
- `src/options/options.js`: method `async onNotificationsToggle()`

**Test Specification** (write these FIRST — the TDD contract)
The verbatim test code in the Implementation Steps is the contract (exact inputs and expected values). Tests added by this task:
- `tests/options/options.test.js` › notifications toggle › ticking requests the notifications permission and saving stores the flag
- `tests/options/options.test.js` › notifications toggle › refused permission unticks the box
- `tests/options/options.test.js` › notifications toggle › unticking does not prompt

**Implementation Steps**
1. Write the tests. Append the following to the end of `tests/options/options.test.js` (keep everything already in the file):

```js
describe('notifications toggle', () => {
  test('ticking requests the notifications permission and saving stores the flag', async () => {
    const options = setup();
    fill();
    const box = document.getElementById('notificationsEnabled');
    box.checked = true;
    await options.onNotificationsToggle();
    expect(chrome.permissions.request).toHaveBeenCalledWith({ permissions: ['notifications'] });
    expect(box.checked).toBe(true);
    await options.save();
    expect((await chrome.storage.sync.get('notificationsEnabled')).notificationsEnabled).toBe(true);
  });

  test('refused permission unticks the box', async () => {
    setup();
    const box = document.getElementById('notificationsEnabled');
    chrome.permissions.request.mockResolvedValueOnce(false);
    box.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(box.checked).toBe(false);
    expect(message().text).toBe('Chrome did not allow notifications.');
  });

  test('unticking does not prompt', async () => {
    const options = setup();
    document.getElementById('notificationsEnabled').checked = false;
    await options.onNotificationsToggle();
    expect(chrome.permissions.request).not.toHaveBeenCalled();
  });
});
```
2. Run `npx jest tests/options/options.test.js` and confirm the new tests FAIL (a missing module or export counts as failing).
3. Commit only the test files: `git add tests/options/options.test.js && git commit -m "test: add options notifications toggle tests"`
4. In `src/options/options.js`, replace this exact text (it occurs exactly once):

```js
    this.testBtn.addEventListener('click', () => this.testConnection());
  }
```

with:

```js
    this.testBtn.addEventListener('click', () => this.testConnection());
    this.notificationsInput.addEventListener('change', () => this.onNotificationsToggle());
  }
```
5. In `src/options/options.js`, insert the following as the last method of class `OptionsManager` (immediately before the class's closing `}` that precedes `document.addEventListener('DOMContentLoaded'`):

```js
  /**
   * Ask for the notifications permission when the checkbox is ticked; untick it if refused.
   *
   * @returns {Promise<void>} Resolves when the permission prompt is answered.
   */
  async onNotificationsToggle() {
    if (!this.notificationsInput.checked) return;
    const granted = await chrome.permissions.request({ permissions: ['notifications'] });
    if (!granted) {
      this.notificationsInput.checked = false;
      this.showMessage('error', 'Chrome did not allow notifications.');
    }
  }
```
6. Light checks: `npm run lint` must exit 0, then `npx jest tests/options/options.test.js` must pass. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
7. Commit: `git add src/options/options.js && git commit -m "feat: request notification permission when notifications are enabled"`

**Context for Implementor**
Storage keys: `chrome.storage.sync` — `baseURL` (normalized, no trailing slash), `apiKey`, `refreshInterval` (integer minutes 1–1440, default 5), `notificationsEnabled` (boolean, default false); `chrome.storage.session` — `watchCache` `{watches, fetchedAt}` and `refreshFailureCount` (number); `chrome.storage.local` — `notifiedUuids` (string[]).
- The service worker registers its notification click handler when the permission is added (`permissions.onAdded`).

**Acceptance Criteria**
- [ ] `npx jest tests/options/options.test.js` passes (14 tests in the file(s) after this task).
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 243 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-38: Build script and lint clean-up
**Type:** Refactor
**Priority:** Medium
**Effort:** Small (<30 min)
**Tier:** Haiku
**Files:** scripts/build.mjs, package.json, eslint.config.mjs

**Current State**
There is no packaging command since the old copy-into-`dist/` scripts were removed; `eslint.config.mjs` still carries the now-empty `LEGACY_FILES` exemption.

**Target State**
- `scripts/build.mjs`: reads `src/manifest.json` and `package.json`, throws `Version mismatch: …` when their versions differ, empties `dist/` (`fs.rmSync`), zips the contents of `src/` into `dist/changedetection-extension-chrome-v<version>.zip` with the system `zip` (excluding `.DS_Store`), prints `Created dist/<zip>`.
- `package.json` scripts add `check` = `npm run lint && npm run test:coverage` and `package` = `npm run check && node scripts/build.mjs`.
- `eslint.config.mjs` replaced by the final version without `LEGACY_FILES`.

**Test Specification** (write these FIRST — the TDD contract)
No unit tests (repo tooling in `scripts/`, not shipped; TDD exemption). Verification by running the script.

**Implementation Steps**
1. Create `scripts/build.mjs` with exactly this content:

```js
/**
 * @file Package the extension for the Chrome Web Store or manual installation.
 *
 * Checks that src/manifest.json and package.json carry the same version, empties dist/,
 * then zips the contents of src/ into dist/changedetection-extension-chrome-v<version>.zip.
 * Usage: `npm run package` (runs lint and tests with coverage first).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Read and parse a JSON file.
 *
 * @param {string} relativePath - Path relative to the repository root.
 * @returns {object} Parsed JSON.
 */
function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

/**
 * Build the zip.
 *
 * @returns {string} Absolute path of the created zip.
 * @throws {Error} When manifest.json and package.json versions differ.
 */
function buildPackage() {
  const { version } = readJson('src/manifest.json');
  const packageVersion = readJson('package.json').version;
  if (version !== packageVersion) {
    throw new Error(`Version mismatch: src/manifest.json has ${version}, package.json has ${packageVersion}`);
  }
  const distDir = path.join(root, 'dist');
  fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(distDir);
  const zipPath = path.join(distDir, `changedetection-extension-chrome-v${version}.zip`);
  execFileSync('zip', ['-r', '-q', zipPath, '.', '-x', '*.DS_Store'], { cwd: path.join(root, 'src'), stdio: 'inherit' });
  return zipPath;
}

console.log(`Created ${path.relative(root, buildPackage())}`);
```
2. In `package.json`, replace this exact text (it occurs exactly once):

```json
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  },
```

with:

```json
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "check": "npm run lint && npm run test:coverage",
    "package": "npm run check && node scripts/build.mjs"
  },
```
3. Replace the entire content of `eslint.config.mjs` with exactly:

```js
/**
 * @file ESLint flat config: recommended rules everywhere; JSDoc and logging-facade rules on
 * shipped code (src/) and repo scripts (scripts/).
 */
import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'coverage/', 'node_modules/'] },
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module' },
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }] },
  },
  {
    files: ['src/**/*.js'],
    languageOptions: { globals: { ...globals.browser, ...globals.webextensions } },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: { globals: { ...globals.browser, ...globals.webextensions, ...globals.node, ...globals.jest } },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    ...jsdoc.configs['flat/recommended-error'],
    files: ['src/**/*.js', 'scripts/**/*.mjs'],
  },
  {
    files: ['src/**/*.js', 'scripts/**/*.mjs'],
    rules: {
      'jsdoc/require-file-overview': 'error',
      'jsdoc/require-description': 'error',
      'jsdoc/require-jsdoc': [
        'error',
        { require: { FunctionDeclaration: true, MethodDefinition: true, ClassDeclaration: true } },
      ],
      'jsdoc/tag-lines': ['error', 'any', { startLines: 1 }],
      'jsdoc/reject-function-type': 'off',
      'jsdoc/reject-any-type': 'off',
    },
  },
  {
    files: ['src/**/*.js'],
    ignores: ['src/lib/log.js'],
    rules: { 'no-console': 'error' },
  },
];
```
4. Run `node scripts/build.mjs` — it must print `Created dist/changedetection-extension-chrome-v1.1.0.zip`; then `unzip -l dist/changedetection-extension-chrome-v1.1.0.zip | grep -E " manifest.json$| background.js$| popup/popup.html$"` must list all three at the zip root. Do not commit `dist/` (gitignored).
5. Light checks: `npm run lint` must exit 0. Do not run coverage, `npm run check`, `npm run package` or `npm audit`.
6. Commit: `git add scripts/build.mjs package.json eslint.config.mjs && git commit -m "build: add packaging script and drop the legacy lint exemption"`

**Context for Implementor**
- `node scripts/build.mjs` is run directly here; `npm run package` also runs the coverage gate, which belongs to the final card.
- `scripts/` holds repo tooling only; `console.log` is allowed there (the `no-console` rule covers `src/` only) but JSDoc is required.

**Acceptance Criteria**
- [ ] `node scripts/build.mjs` prints `Created dist/changedetection-extension-chrome-v1.1.0.zip` and the zip has `manifest.json` at its root.
- [ ] `grep -c LEGACY_FILES eslint.config.mjs` prints `0`.
- [ ] `npm run lint` exits 0.
- [ ] No regressions: `npm test` passes — 243 tests in total after this task.
- [ ] Docs: no impact (handled by the final validation card).

---
### TASK-39: Documentation, full verification and whole-plan review
**Type:** Inconsistency
**Priority:** High
**Effort:** Large (half day+)
**Tier:** Sonnet — writing concise user and architecture docs from the finished code and judging whole-plan consistency needs reading across every module, which a Haiku session cannot do reliably
**Files:** README.md, docs/ARCHITECTURE.md (new), docs/HISTORY.md (new), DEVELOPMENT.md (delete), INSTALLATION.md (delete), DISTRIBUTION.md (delete), BADGE_FIXES.md (delete); any file under `src/` or `tests/` only to fix a verified defect

**Current State**
TASKS 1–38 delivered the 1.1.0 code: `src/` extension with `lib/` modules, rewritten service worker, popup and options pages, Jest/ESLint tooling and `scripts/build.mjs`. The narrative docs are stale: `README.md` describes a PATCH endpoint, a fixed 5-minute refresh, a "🔄 Refresh" button, a non-existent icons step, a dead placeholder image and old project structure; `DEVELOPMENT.md`, `INSTALLATION.md`, `DISTRIBUTION.md` and `BADGE_FIXES.md` duplicate and contradict it. Full coverage, packaging and audit have not run since the toolchain changed.

**Target State**
1. **Documentation, as built and short** (the user asked for "very to the point"; no internals in README):
   - `README.md` (≈ 80–120 lines): one-paragraph purpose; **Features** (badge count and grey `!` with tooltip; click opens the diff and marks viewed; ↗ opens the page; Ctrl/Cmd/middle-click opens in the background; Mark all viewed; Recheck all; filter for 10+ watches; Watch this page; per-watch error marker; dark mode; Alt+Shift+D; optional desktop notifications); **Requirements** (Chrome 120+, changedetection.io 0.50.12+ with an API key); **Install** (load `src/` unpacked, or the zip from `npm run package`); **Setup** (Server URL as opened in the browser, API key from Settings → API, Test connection, Save — Chrome asks once for access to the server; LAN servers need this access); **Troubleshooting** (API key rejected → key; API not found → URL / server version; Access not granted → Grant access in the popup or Save again; Cannot reach / did not respond → server or network; grey `!` meaning); **Privacy** (talks only to your server; settings incl. API key in Chrome sync storage); **Development** (one line pointing to `docs/ARCHITECTURE.md` and `npm run check`); **License** (MIT). Remove the placeholder image.
   - `docs/ARCHITECTURE.md` (≈ 100–150 lines): component table (each `src/` file → responsibility); refresh cycle (triggers, failure counter, badge rules, cache, notifications baseline); message contract table (the six `ACTIONS` with request fields and response data); storage keys table (sync / session / local); permission model (optional host permission per origin, `activeTab`, optional `notifications`, why no `tabs`); unread rule and server facts (`viewed`, `last_changed`, single `PUT last_viewed`, `/diff/<uuid>`); logging conventions; testing approach (chrome fake, `hasLog`); build and release (version source of truth, `npm run package`).
   - `docs/HISTORY.md`: newest first. **1.1.0** (date of your commit) — bullets for every user-visible change and fix of this plan (unread-rule fix for new watches, count badge + error state, diff opening, single-PUT marking, test connection no longer saves, LAN access via optional host permission, removed `tabs` permission, timeouts and friendly errors, cache-first popup, features A–H, dark mode/accessibility, ESLint/Jest/JSDoc toolchain, packaging script). **1.0.1** (2025-09-26): hardened permissions (removed `tabs`/host permissions and the content script). **1.0.0** (2025-09-17 → 2025-09-23): initial Chrome MV3 release — watch list, unread badge, mark as watched, single refresh interval, sorting by last change, icons, stability fixes and version display.
   - Delete `DEVELOPMENT.md`, `INSTALLATION.md`, `DISTRIBUTION.md`, `BADGE_FIXES.md` with `git rm` (their still-true content lives in the three docs above).
2. **Heavy verification** — run and make green, fixing only verified defects (never lowering thresholds, never weakening tests): `npm ci`; `npm run check` (lint + coverage: ≥ 95 % statements/lines/functions, ≥ 90 % branches; planning run: 99.8 / 97.2 / 100 / 100); `npm run package` → `dist/changedetection-extension-chrome-v1.1.0.zip` containing `manifest.json` at the root and no `.DS_Store`; `npm audit` → 0 vulnerabilities (dependencies changed in TASK-2/3).
3. **Whole-plan consistency review** — confirm and fix:
   - no leftovers of the legacy code: `grep -rnE "countUnreadWatches|updateWatchViewed|markAsRead|browserAction|isInitialized|LEGACY_FILES" src tests eslint.config.mjs` and `grep -rnE "\.innerHTML|style\.display" src` both print nothing (the test helper `tests/helpers/dom.js` legitimately uses `innerHTML` to load page markup — leave it), and `alarmWatchdog` appears only in `LEGACY_ALARMS` (`src/lib/scheduler.js`), `tests/lib/scheduler.test.js` and `tests/background.test.js`;
   - `console.` appears in `src/` only inside `src/lib/log.js`; every `src/**/*.js` and `scripts/build.mjs` passes the JSDoc lint rules;
   - every `ACTIONS` value is handled in `src/background.js` `runAction` and sent from exactly the page that needs it; element ids used in `popup.js`/`options.js` exist in their HTML;
   - `src/manifest.json` version equals `package.json` version (1.1.0); the permissions are exactly those pinned in `tests/manifest.test.js`;
   - no file outside the allowed locations (`src/`, `tests/`, `docs/`, `scripts/`, plus root `package.json`, `package-lock.json`, `eslint.config.mjs`, `.gitignore`, `README.md`, `LICENSE`, `CLAUDE.md`); `.PROMPTS/`, `.claude/`, `CLAUDE.md` remain untracked.

**Test Specification** (write these FIRST — the TDD contract)
No new behaviour. If the review finds a defect, first add a failing test in the matching `tests/` file that reproduces it, commit it (`test: …`), then fix (`fix: …`). Otherwise the existing 243 tests are the specification.

**Implementation Steps**
1. Read `src/` and `tests/` end to end (they are small) before writing docs; describe what the code does, not what the plan said.
2. Write `docs/ARCHITECTURE.md` and `docs/HISTORY.md`, rewrite `README.md`, `git rm` the four legacy docs. Keep every document short: tables and bullets, no repetition between README and ARCHITECTURE.
3. Run the heavy verification of Target State 2; fix failures test-first.
4. Run the consistency review of Target State 3; fix findings test-first.
5. Commit docs: `git add README.md docs/ARCHITECTURE.md docs/HISTORY.md && git commit -m "docs: as-built README, architecture and history for 1.1.0"` (the `git rm` deletions are already staged). Commit any fixes separately with explicit paths.
6. In your final report, list the manual LAN smoke test for the maintainer (it cannot run unattended): load `src/` unpacked in Chrome → options page opens → enter the LAN server URL and API key → Test connection shows version and watch count (Chrome asks for access once) → Save → badge shows the unread count → popup lists watches → click an unread watch opens its diff and the badge decrements → middle-click keeps the popup open → Mark all viewed clears the badge → stop the server: after two refreshes the badge turns grey `!` with the error in the tooltip → enable notifications, trigger a change, a notification appears and opens the diff.

**Context for Implementor**
- Tooling: Node ≥ 22.13; `npm run lint` (ESLint 10 + JSDoc gate), `npm test`, `npm run test:coverage`, `npm run check`, `npm run package`. Tests run in Jest 30 + jsdom with an in-memory `chrome` fake (`tests/helpers/`).
- Message contract (`src/lib/messages.js`): `getWatches` → `{watches, fetchedAt}`; `openWatch {uuid, url, lastChanged, background}`; `markAllViewed {items}` → `{markedUuids, failed}`; `testConnection {baseURL, apiKey}` → `{version, watchCount}`; `addWatch {url}` → `{uuid}`; `recheckAll` → `{message}`; responses `{success, data?}` / `{success: false, error, errorKind?}`.
- Storage: sync `baseURL`, `apiKey`, `refreshInterval`, `notificationsEnabled`; session `watchCache`, `refreshFailureCount`; local `notifiedUuids`.
- Do not change public names, message shapes, storage keys, log formats or UI strings unless a verified defect requires it (and then update the tests that pin them, saying so in the commit). Do not edit `.PROMPTS/`, `.claude/`, `CLAUDE.md`, `dist/` or `node_modules/`. Do not push.

**Acceptance Criteria** (plan-level definition of done)
- [ ] `npm ci && npm run check` exits 0: lint clean (incl. JSDoc), all tests pass with zero skipped, coverage ≥ 95 % statements/lines/functions and ≥ 90 % branches.
- [ ] `npm run package` creates `dist/changedetection-extension-chrome-v1.1.0.zip` with `manifest.json` at the root; `npm audit` reports 0 vulnerabilities.
- [ ] Unread = `last_changed > 0 && viewed === false` everywhere (badge, popup, notifications); new watches no longer light the badge.
- [ ] Badge: unread count with `99+` cap; grey `!` + error tooltip from the second consecutive failure; cleared when unconfigured.
- [ ] Server access: optional host permission for the configured origin only (Save, Test connection, popup Grant access); no `tabs`, no `host_permissions`, no content scripts; works against a LAN server.
- [ ] Popup: diff on click with single-PUT marking, ↗ page link, background-tab modifiers, Mark all viewed (bounded concurrency), Recheck all, filter (≥ 10), Watch this page, error marker, instant cached render, dark mode, keyboard-accessible, no `innerHTML`.
- [ ] Options: normalised URL, http/https only, interval 1–1440, test connection without saving, notifications opt-in with permission, messages that stay visible.
- [ ] Service worker: refresh alarm ensured at every start, legacy alarms removed, options page on first install, refresh on wake/settings/permission changes, notification clicks open the diff.
- [ ] Telemetry: every action logs one INFO line via `createLogger`, sub-steps at DEBUG, degraded paths at WARN, failures at ERROR; the API key never appears in logs (tests assert it).
- [ ] Docs as built and concise: `README.md` (user-facing, no internals), `docs/ARCHITECTURE.md`, `docs/HISTORY.md` with 1.1.0 / 1.0.1 / 1.0.0; the four legacy `*.md` files removed.
- [ ] Version 1.1.0 in `src/manifest.json` and `package.json`; `LICENSE` present.
- [ ] Consistency review items in Target State 3 all pass; the manual LAN smoke-test checklist is in the final report.

---

## DEPENDENCY MAP

- TASK-1 precedes everything (all paths are under `src/` afterwards).
- TASK-2 precedes every task that writes tests (chrome fake, `hasLog`, `loadHtml`, Jest 30 + Babel for ES modules).
- TASK-3 precedes TASK-22, TASK-26, TASK-35 (they edit its `LEGACY_FILES` line) and TASK-38 (replaces the config); every later task relies on its JSDoc/no-console gate.
- TASK-4 (manifest) precedes TASK-22/23 (module service worker), TASK-33 (`activeTab`), TASK-37 (`notifications` optional permission) and TASK-38 (version check).
- TASK-5 (logger) precedes every module that logs: TASK-12…15, 18…23, 26, 35.
- TASK-6 precedes TASK-24 and TASK-26 (relative times).
- TASK-7 → TASK-8 → TASK-9 (same file, appended in order); TASK-7 precedes TASK-18/19/20; TASK-8 precedes TASK-24/27; TASK-9 precedes TASK-32/33.
- TASK-10 → TASK-11 (same file); TASK-11 precedes TASK-19, 20, 21, 30, 35; TASK-10 precedes TASK-21 (`validateConnection`).
- TASK-12 → TASK-13 (same class); TASK-13 precedes TASK-19/20/21.
- TASK-14, 15, 16, 17, 18 precede TASK-19…23 as imported; TASK-16 precedes TASK-29; TASK-17 precedes TASK-26 and TASK-35.
- TASK-19 precedes TASK-22; TASK-20 → TASK-21 (same file) → TASK-22 → TASK-23 (same file).
- TASK-24 and TASK-25 precede TASK-26; TASK-26 → 27 → 28 → 29 → 30 → 31 → 32 → 33 (each edits `src/popup/popup.js` and appends to `tests/popup/popup.test.js` in this order).
- TASK-34 precedes TASK-35 → 36 → 37 (same files, in order).
- TASK-35 empties `LEGACY_FILES`, so it precedes TASK-38; TASK-38 precedes TASK-39.

## DO NOT TOUCH

- `.PROMPTS/`, `.claude/`, `CLAUDE.md` — planning and agent configuration, untracked on purpose. Never edit, stage or commit them. Always `git add <explicit paths>`; never `git add -A`, `git add .` or `git commit -a`.
- `dist/` and `coverage/` — generated, gitignored; never commit. `node_modules/` — never edit.
- `package-lock.json` — changed only by the exact `npm install`/`npm uninstall` commands a card gives; never hand-edited; never run `npm audit fix` or upgrade other packages.
- `src/icons/*.png` — binary assets, keep as they are.
- Legacy files `src/background.js`, `src/popup/popup.js`, `src/options/options.js` and the legacy popup/options HTML/CSS — only the card that rewrites a file touches it; do not "fix" lint or behaviour in them otherwise (they are exempt via `LEGACY_FILES` until rewritten).
- `README.md`, `DEVELOPMENT.md`, `INSTALLATION.md`, `DISTRIBUTION.md`, `BADGE_FIXES.md` and `docs/` — only TASK-39 edits narrative documentation.
- `.gitignore` entries `.github/` and `package.lock.json` (a harmless typo) and the untracked `.github/copilot-instructions.md` — leave as they are; only TASK-2 adds `coverage/`.
- `eslint.config.mjs` — besides TASK-3 (creates) and TASK-38 (final version), cards change only the `LEGACY_FILES` line they name; never add `eslint-disable` comments anywhere.
- Test files of earlier cards — later cards only append the blocks they give or replace the exact import lines they quote; never change existing assertions.
- `src/manifest.json` after TASK-4 — no card adds permissions, `host_permissions` or content scripts.
- Never `git push`.

## ESCALATE TO OPUS

None. Every card was reduced to verified, literal edits; the only judgement-heavy work (as-built documentation and whole-plan review) is TASK-39 on Sonnet.
