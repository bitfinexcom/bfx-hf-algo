'use strict'

const generateInitialOrder = require('../util/generate_initial_order')

/**
 * Generates and submits the initial atomic order as configured within the
 * execution parameters.
 *
 * Mapped to the `'self:submit_initial_order'` event.
 *
 * @memberOf module:OCOCO
 * @param {object} instance - AO instance
 * @returns {Promise} p - resolves on completion
 * @see module:OCOCO~generateInitialOrder
 */
const onSelfSubmitInitialOrder = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { emit, debug } = h
  const { args = {}, gid } = state
  const { submitDelay } = args

  const order = generateInitialOrder(instance)

  debug(
    'generated order %s for %f @ %f',
    order.type, order.amount, order.price || 'MARKET'
  )

  return emit('exec:order:submit:all', gid, [order], submitDelay)
}

module.exports = onSelfSubmitInitialOrder
