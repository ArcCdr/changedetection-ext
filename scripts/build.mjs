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
