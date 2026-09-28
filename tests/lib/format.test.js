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
