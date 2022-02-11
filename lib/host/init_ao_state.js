'use strict'

const clientID = require('../util/gen_client_id')
const _isFunction = require('lodash/isFunction')
const _isString = require('lodash/isString')
const AsyncEventEmitter = require('../async_event_emitter')

/**
 * @typedef {Object} InitialAoState
 * @property {array} channels
 * @property {Object} orders
 * @property {Object} cancelledOrders
 * @property {Object} allOrders
 * @property {AsyncEventEmitter} ev
 * @property {boolean} active
 * @property {Object} headersForLogFile
 * @property {number} createdAt
 * @property {string} label
 * @property {string} name
 * @property {Object} args
 * @property {string} gid
 * @property {string} id
 * @property {boolean|Object} i18n
 */

/**
 * Creates the initial state object for an algo order, after processing
 * and validating the provided arguments.
 *
 * @param {object} aoDef - algo order definition object
 * @param {object} args - instance arguments
 * @param {object} pairConfig
 * @returns {object} initialState
 */
module.exports = (aoDef = {}, args = {}, pairConfig = {}) => {
  const { meta = {}, id, name, headersForLogFile } = aoDef
  const { validateParams, processParams, initState, genOrderLabel } = meta
  const params = _isFunction(processParams)
    ? processParams(args)
    : args

  if (_isFunction(validateParams)) {
    const vError = validateParams(params, pairConfig)

    if (vError) {
      const error = new Error(_isString(vError) ? vError : vError.message)

      error.i18n = vError.i18n
      throw error
    }
  }

  const initialState = _isFunction(initState)
    ? initState(params, pairConfig)
    : {}

  const gid = String(clientID())
  const label = _isFunction(genOrderLabel) ? genOrderLabel({ args: params }) : name

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
    createdAt: Date.now(),
    label: _isString(label) ? label : label.origin,
    name,
    args,
    gid,
    id,
    i18n: !_isString(label) && {
      label: label.i18n
    },

    ...initialState
  }
}
