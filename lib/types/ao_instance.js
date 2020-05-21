'use strict'

/**
 * An object containing all state for an algorithmic order instance. Includes
 * the {@link module:bfx-hf-algo.AsyncEventEmitter|AsyncEventEmitter} instance
 * used to trigger internal order logic.
 *
 * @typedef {object} module:bfx-hf-algo.AOInstance
 * @property {module:bfx-hf-algo/Helpers} h - helpers bound to the instance
 * @property {object} state - instance state used during execution
 * @property {number} state.id - ID of the instance
 * @property {number} state.gid - ID of the order group, attached to all
 *   orders
 * @property {Array} state.channels - subscribed channels and their filters
 * @property {object} state.orders - map of open orders key'd by client ID
 * @property {object} state.cancelledOrders - map of cancelled orders key'd
 *   by client ID
 * @property {object} state.allOrders - map of all orders ever created by
 *   the instance key'd by client ID
 * @property {module:bfx-hf-algo.AsyncEventEmitter} state.ev - internal event
 *   emitter
 */
