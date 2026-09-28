/**
 * @file Message contract between the popup/options pages and the background service worker.
 *
 * Requests are `{action: ACTIONS.X, ...fields}`. Every response is either
 * `{success: true, data?}` or `{success: false, error, errorKind?}`.
 */

export const ACTIONS = Object.freeze({
  GET_WATCHES: 'getWatches',
  OPEN_WATCH: 'openWatch',
  MARK_ALL_VIEWED: 'markAllViewed',
  TEST_CONNECTION: 'testConnection',
  ADD_WATCH: 'addWatch',
  RECHECK_ALL: 'recheckAll',
});

/**
 * Response envelope returned by the service worker.
 *
 * @typedef {object} MessageResponse
 * @property {boolean} success - Whether the action succeeded.
 * @property {*} [data] - Action result on success.
 * @property {string} [error] - User-safe error message on failure.
 * @property {string} [errorKind] - ApiError kind on failure, e.g. 'permission'.
 */

/**
 * Send a message to the service worker; never throws.
 *
 * @param {object} message - Request with an `action` field from ACTIONS.
 * @returns {Promise<MessageResponse>} The response, or a failure envelope when messaging fails.
 */
export async function sendMessage(message) {
  try {
    const response = await chrome.runtime.sendMessage(message);
    return response ?? { success: false, error: 'No response from the background service worker' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
