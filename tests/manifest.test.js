import fs from 'node:fs';
import path from 'node:path';

const root = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'src/manifest.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

describe('manifest.json', () => {
  test('is Manifest V3 with the same version as package.json', () => {
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.version).toBe('1.1.1');
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
