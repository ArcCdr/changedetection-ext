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
