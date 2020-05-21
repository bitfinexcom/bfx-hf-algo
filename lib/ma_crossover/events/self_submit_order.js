'use strict'

const generateOrder = require('../util/generate_order')

/**
 * Generates and submits the configured order.
 *
 * @memberOf module:MACrossover
 * @listens module:MACrossover~selfSubmitOrder
 *
 * @param {module:bfx-hf-algo.AOInstance} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onSelfSubmitOrder = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { emit, debug } = h
  const { args = {}, gid } = state
  const { submitDelay } = args

  const order = generateOrder(instance)

  debug(
    'generated order %s for %f @ %f',
    order.type, order.amount, order.price || 'MARKET'
  )

  return emit('exec:order:submit:all', gid, [order], submitDelay)
}

module.exports = onSelfSubmitOrder
