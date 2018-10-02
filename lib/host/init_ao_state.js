'use strict'

const { nonce } = require('bfx-api-node-util')
const _isFunction = require('lodash/isFunction')
const AsyncEventEmitter = require('../async_event_emitter')

/**
 * Creates the initial state object for an algo order, after processing
 * and validating the provided arguments.
 *
 * @param {Object} aoDef - algo order definition object
 * @param {Object} args - instance arguments
 * @return {Object} initialState
 */
module.exports = (aoDef = {}, args = {}) => {
  const { meta = {}, id } = aoDef
  const { validateParams, processParams, initState } = meta
  const params = _isFunction(processParams)
    ? processParams(args)
    : args

  if (_isFunction(validateParams)) {
    const vError = validateParams(params)

    if (vError) {
      throw new Error(vError)
    }
  }

  const initialState = _isFunction(initState)
    ? initState(params)
    : {}

  const gid = nonce() + ''

  return {
    channels: [],
    orders: {}, // active
    cancelledOrders: {}, // cancelled by us (not via UI)
    allOrders: {}, // active + closed
    id: id,
    gid: gid,
    ev: new AsyncEventEmitter(),

    ...initialState
  }
}
