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
