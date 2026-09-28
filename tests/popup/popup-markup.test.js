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
