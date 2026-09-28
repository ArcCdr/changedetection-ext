/**
 * @file Service worker entry point.
 *
 * Routes messages from the popup and options pages to lib/actions.js and lib/refresh.js.
 * All listeners are registered synchronously at top level, as Manifest V3 requires.
 */
import { addWatch, markAllViewed, openWatch, recheckAll, testConnection } from './lib/actions.js';
import { createLogger } from './lib/log.js';
import { ACTIONS } from './lib/messages.js';
import { refreshWatches } from './lib/refresh.js';

const log = createLogger('background');

/**
 * Run the operation named by a message.
 *
 * @param {{action: string}} request - Message from a page; see lib/messages.js.
 * @returns {Promise<*>} The operation result, undefined when it has none.
 * @throws {Error} For unknown actions and failed operations.
 */
async function runAction(request) {
  switch (request.action) {
    case ACTIONS.GET_WATCHES: {
      const { watches, fetchedAt } = await refreshWatches('popup');
      return { watches, fetchedAt };
    }
    case ACTIONS.OPEN_WATCH:
      return openWatch(request);
    case ACTIONS.MARK_ALL_VIEWED:
      return markAllViewed(request.items ?? []);
    case ACTIONS.TEST_CONNECTION:
      return testConnection(request);
    case ACTIONS.ADD_WATCH:
      return addWatch(request);
    case ACTIONS.RECHECK_ALL:
      return recheckAll();
    default:
      throw new Error(`Unknown action: ${request.action}`);
  }
}

/**
 * Handle one message and wrap the result in the response envelope; never throws.
 *
 * @param {{action: string}} request - Message from a page.
 * @returns {Promise<import('./lib/messages.js').MessageResponse>} `{success: true, data?}` or `{success: false, error, errorKind?}`.
 */
export async function handleMessage(request) {
  try {
    const data = await runAction(request ?? {});
    return data === undefined ? { success: true } : { success: true, data };
  } catch (error) {
    log.warn('Message %s failed: %s', String(request?.action), error.message);
    return { success: false, error: error.message, errorKind: error.kind };
  }
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  handleMessage(request).then(sendResponse);
  return true;
});
