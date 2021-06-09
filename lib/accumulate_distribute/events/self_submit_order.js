'use strict'

const generateOrder = require('../util/generate_order')
const getOrderData = require('../util/get_order_log_data')

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
 * @param {AOInstance} instance - AO instance state
 * @returns {Promise} p
 */
const onSelfSubmitOrder = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { emit, debug } = h
  const { args = {}, gid } = state
  const { orderType, offsetType, capType } = args

  const order = generateOrder.gen(instance)

  if (order) {
    debug('generated order for %f @ %f', order.amount, order.price)
    await emit('exec:order:submit:all', gid, [order], 0)

    if (orderType === 'RELATIVE') {
      await emit('exec:log_algo_data', gid, getOrderData(order, state), `order_offset_${offsetType}_cap_${capType}`, 'ORDER_SUBMIT_LOG')
    }
  } else {
    debug('awaiting data for offset/cap, cannot submit order...')
  }
}

module.exports = onSelfSubmitOrder
