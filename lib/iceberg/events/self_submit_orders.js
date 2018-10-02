'use strict'

const generateOrders = require('../util/generate_orders')

module.exports = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { emit } = h
  const { args = {}, gid } = state
  const { submitDelay } = args
  const orders = generateOrders(state)

  await emit('exec:order:submit:all', gid, orders, submitDelay)
}
