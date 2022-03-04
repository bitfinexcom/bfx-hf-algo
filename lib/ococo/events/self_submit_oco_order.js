'use strict'

const generateOCOOrder = require('../util/generate_oco_order')
const { OrderSignal } = require('bfx-hf-signals/lib/types')

/**
 * Generates and submits the OCO order as configured within the execution
 * parameters.
 *
 * Mapped to the `'self:submit_oco_order'` event.
 *
 * @memberOf module:OCOCO
 * @listens module:OCOCO~selfSubmitOCOOrder
 * @see module:OCOCO.generateOCOOrder
 *
 * @param {AOInstance} instance - AO instance
 * @param {Signal} origin
 * @returns {Promise} p - resolves on completion
 */
const onSelfSubmitOCOOrder = async (instance = {}, origin) => {
  const { state = {}, h = {} } = instance
  const { emit, debug, tracer } = h
  const { gid } = state

  const order = generateOCOOrder(instance)

  debug(
    'generated order %s for %f @ %s',
    order.type, order.amount, order.price || 'MARKET'
  )

  tracer.collect(new OrderSignal(order, origin))

  return emit('exec:order:submit:all', gid, [order], 0)
}

module.exports = onSelfSubmitOCOOrder
