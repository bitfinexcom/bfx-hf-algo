'use strict'

const generateInitialOrder = require('../util/generate_initial_order')
const { OrderSignal } = require('bfx-hf-signals/lib/types')

/**
 * Generates and submits the initial atomic order as configured within the
 * execution parameters.
 *
 * Mapped to the `'self:submit_initial_order'` event.
 *
 * @memberOf module:Bracket
 * @listens module:Bracket~selfSubmitInitialOrder
 * @see module:Bracket.generateInitialOrder
 *
 * @param {AOInstance} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onSelfSubmitInitialOrder = async (instance = {}, origin) => {
  const { state = {}, h = {} } = instance
  const { emit, debug, tracer } = h
  const { gid } = state

  const order = generateInitialOrder(instance)

  debug(
    'generated order %s for %f @ %s',
    order.type, order.amount, order.price || 'MARKET'
  )

  tracer.collect(new OrderSignal(order, origin))

  return emit('exec:order:submit:all', gid, [order], 0)
}

module.exports = onSelfSubmitInitialOrder
