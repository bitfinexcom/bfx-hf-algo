'use strict'

const { nonce } = require('bfx-api-node-util')
const _isFunction = require('lodash/isFunction')
const AsyncEventEmitter = require('../async_event_emitter')

module.exports = (aoDef = {}, args = {}) => {
  const { meta = {}, id } = aoDef
  const { validateParams, processParams, initState } = meta

  if (_isFunction(validateParams)) {
    const vError = validateParams(args)

    if (vError) {
      throw new Error(vError)
    }
  }

  const params = _isFunction(processParams)
    ? processParams(args)
    : args

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
