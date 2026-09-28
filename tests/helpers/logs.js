/**
 * @file Helpers to assert on log output captured by the console spies in test-setup.js.
 */

/**
 * Render the recorded console calls of one level as text, substituting %s / %d placeholders.
 *
 * @param {'debug'|'info'|'warn'|'error'} level - Console method.
 * @returns {string[]} One rendered line per call.
 */
export function logLines(level) {
  return console[level].mock.calls.map(([message, ...args]) => {
    const rest = [...args];
    const text = String(message).replace(/%[sdifoO]/g, () => String(rest.shift()));
    return [text, ...rest.map(String)].join(' ');
  });
}

/**
 * Whether any recorded line of a level matches.
 *
 * @param {'debug'|'info'|'warn'|'error'} level - Console method.
 * @param {string|RegExp} pattern - Substring or regular expression.
 * @returns {boolean} True when at least one line matches.
 */
export function hasLog(level, pattern) {
  return logLines(level).some((line) => (pattern instanceof RegExp ? pattern.test(line) : line.includes(pattern)));
}

/**
 * All recorded log lines of every level, joined with newlines.
 *
 * @returns {string} Text of every log call.
 */
export function allLogText() {
  return ['debug', 'info', 'warn', 'error'].flatMap(logLines).join('\n');
}
