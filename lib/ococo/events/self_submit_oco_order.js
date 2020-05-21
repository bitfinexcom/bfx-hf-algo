'use strict'

const generateOCOOrder = require('../util/generate_oco_order')

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
 * @param {module:bfx-hf-algo.AOInstance} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onSelfSubmitOCOOrder = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { emit, debug } = h
  const { args = {}, gid } = state
  const { submitDelay } = args

  const order = generateOCOOrder(instance)

  debug(
    'generated order %s for %f @ %f',
    order.type, order.amount, order.price || 'MARKET'
  )

  return emit('exec:order:submit:all', gid, [order], submitDelay)
}

module.exports = onSelfSubmitOCOOrder
