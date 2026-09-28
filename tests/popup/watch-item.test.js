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
