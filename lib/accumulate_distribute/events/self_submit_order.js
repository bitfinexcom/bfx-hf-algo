'use strict'

const generateOrder = require('../util/generate_order')

module.exports = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { emit, debug } = h
  const { args = {}, gid } = state
  const { submitDelay } = args

  const order = generateOrder(instance)

  if (order) {
    debug('generated order for %f @ %f', order.amount, order.price)
    await emit('exec:order:submit:all', gid, [order], submitDelay)
  }
}
