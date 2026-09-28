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

const BASE = 'http://192.168.1.10:5000';

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
