'use strict'

const clientID = require('../util/gen_client_id')
const _isFunction = require('lodash/isFunction')
const _isString = require('lodash/isString')
const AsyncEventEmitter = require('../async_event_emitter')

/**
 * Creates the initial state object for an algo order, after processing
 * and validating the provided arguments.
 *
 * @param {object} aoDef - algo order definition object
 * @param {object} args - instance arguments
 * @returns {object} initialState
 */
module.exports = (aoDef = {}, args = {}) => {
  const { meta = {}, id, name, headersForLogFile } = aoDef
  const { validateParams, processParams, initState, genOrderLabel } = meta
  const params = _isFunction(processParams)
    ? processParams(args)
    : args

  if (_isFunction(validateParams)) {
    const vError = validateParams(params)

    if (vError) {
      throw new Error(_isString(vError) ? vError : vError.message)
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
    headersForLogFile,
    label: genOrderLabel ? genOrderLabel({ args: params }) : name,
    name,
    args,
    gid,
    id,

    ...initialState
  }
}
