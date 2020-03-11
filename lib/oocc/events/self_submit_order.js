'use strict'

const generateOrder = require('../util/generate_order')

/**
 * Submits the configured order and emits the `exec:stop` event to trigger
 * teardown.
 *
 * @memberOf module:OOCC
 * @listens module:OOCC~selfSubmitOrder
 *
 * @param {AOInstance} instance - AO instance
 * @returns {Promise} p - resolves on completion
 * @see module:OOCC~generateOrders
 */
const onSelfSubmitOrder = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { emit } = h
  const { args = {}, gid } = state
  const { submitDelay } = args
  const order = generateOrder(state)

  return emit('exec:order:submit:all', gid, [order], submitDelay)
}

module.exports = onSelfSubmitOrder
