/**
 * @file Levelled console logger; every line starts with `[cdio:<scope>]`.
 *
 * Levels map to console methods: debug → console.debug (shown in Chrome DevTools only when
 * the "Verbose" level is enabled), info → console.info, warn → console.warn,
 * error → console.error. Use `%s` / `%d` placeholders, never template literals, and never
 * pass the API key or request headers.
 */

/**
 * Logger bound to one scope.
 *
 * @typedef {object} Logger
 * @property {function(string, ...*): void} debug - Sub-steps and internals.
 * @property {function(string, ...*): void} info - One line per meaningful action.
 * @property {function(string, ...*): void} warn - Degraded but continuing.
 * @property {function(string, ...*): void} error - The operation failed.
 */

/**
 * Create a logger whose lines start with `[cdio:<scope>]`.
 *
 * @param {string} scope - Component name, e.g. 'background' or 'popup'.
 * @returns {Logger} The scoped logger.
 */
export function createLogger(scope) {
  const tag = `[cdio:${scope}]`;
  return {
    debug: (message, ...args) => console.debug(`${tag} ${message}`, ...args),
    info: (message, ...args) => console.info(`${tag} ${message}`, ...args),
    warn: (message, ...args) => console.warn(`${tag} ${message}`, ...args),
    error: (message, ...args) => console.error(`${tag} ${message}`, ...args),
  };
}
