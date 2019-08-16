'use strict'

const generateOrder = require('../util/generate_order')

module.exports = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { emit, debug } = h
  const { args = {}, gid } = state
  const { submitDelay } = args

  const order = generateOrder(instance)

  debug(
    'generated order %s for %f @ %f',
    order.type, order.amount, order.price || 'MARKET'
  )

  await emit('exec:order:submit:all', gid, [order], submitDelay)
}
