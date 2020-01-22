'use strict'

const generateInitialOrder = require('../util/generate_initial_order')

module.exports = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { emit, debug } = h
  const { args = {}, gid } = state
  const { submitDelay } = args

  const order = generateInitialOrder(instance)

  debug(
    'generated order %s for %f @ %f',
    order.type, order.amount, order.price || 'MARKET'
  )

  await emit('exec:order:submit:all', gid, [order], submitDelay)
}
