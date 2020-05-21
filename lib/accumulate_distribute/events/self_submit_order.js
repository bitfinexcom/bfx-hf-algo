'use strict'

const generateOrder = require('../util/generate_order')

/**
 * Mapped to the `self:submit_order` event and triggered by the instance itself.
 *
 * Generates an order and submits it if the necessary data was received for
 * price offset & cap calculation.
 *
 * @memberOf module:AccumulateDistribute
 * @listens module:AccumulateDistribute~event:selfSubmitOrder
 * @see module:AccumulateDistribute~generateOrder
 *
 * @param {module:bfx-hf-algo.AOInstance} instance - AO instance state
 * @returns {Promise} p
 */
const onSelfSubmitOrder = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { emit, debug } = h
  const { args = {}, gid } = state
  const { submitDelay } = args

  const order = generateOrder.gen(instance)

  if (order) {
    debug('generated order for %f @ %f', order.amount, order.price)
    await emit('exec:order:submit:all', gid, [order], submitDelay)
  } else {
    debug('awaiting data for offset/cap, cannot submit order...')
  }
}

module.exports = onSelfSubmitOrder
