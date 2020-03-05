'use strict'

const clientID = require('../util/gen_client_id')
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
  const { meta = {}, id, name } = aoDef
  const { validateParams, processParams, initState, genOrderLabel } = meta
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

  const gid = clientID() + ''

  // All AOs and the AO host + helpers depend on the structure below; as such
  // it should be modified with great care
  return {
    channels: [],
    orders: {}, // active
    cancelledOrders: {}, // cancelled by us (not via UI)
    allOrders: {}, // active + closed
    ev: new AsyncEventEmitter(),
    active: false,
    label: genOrderLabel ? genOrderLabel({ args: params }) : name,
    name,
    args,
    gid,
    id,

    ...initialState
  }
}
