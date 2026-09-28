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
