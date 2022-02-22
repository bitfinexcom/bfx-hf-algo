'use strict'

const { types: { OrderSignal } } = require('bfx-hf-signals')

const generateOrder = require('../util/generate_order')

/**
 * Generates and submits the configured order.
 *
 * @memberOf module:MACrossover
 * @listens module:MACrossover~selfSubmitOrder
 *
 * @param {AOInstance} instance - AO instance
 * @param {Signal?} origin
 * @returns {Promise} p - resolves on completion
 */
const onSelfSubmitOrder = async (instance = {}, origin) => {
  const { state = {}, h = {} } = instance
  const { emit, debug, tracer } = h
  const { gid } = state

  const order = generateOrder(instance)

  debug(
    'generated order %s for %f @ %s',
    order.type, order.amount, order.price || 'MARKET'
  )

  tracer.collect(new OrderSignal(order, origin))

  return emit('exec:order:submit:all', gid, [order], 0)
}

module.exports = onSelfSubmitOrder
