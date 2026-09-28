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
