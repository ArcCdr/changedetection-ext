/**
 * @file DOM helpers for tests of extension pages.
 */
import fs from 'node:fs';
import path from 'node:path';

/**
 * Replace the jsdom document with the markup of an extension HTML page (scripts are not executed).
 *
 * @param {string} relativePath - Path of the HTML file relative to the repository root, e.g. 'src/popup/popup.html'.
 */
export function loadHtml(relativePath) {
  const html = fs.readFileSync(path.join(__dirname, '..', '..', relativePath), 'utf8');
  document.documentElement.innerHTML = html.replace(/<!DOCTYPE html>/i, '');
}

/**
 * Wait for all pending promise callbacks and timers-free microtasks to run.
 *
 * @returns {Promise<void>} Resolves after the microtask queue drains.
 */
export function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
