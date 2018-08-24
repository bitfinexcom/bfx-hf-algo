'use strict'

const PI = require('p-iteration')
const generateOrders = require('../util/generate_orders')

module.exports = async (state = {}, h = {}) => {
  const { emit, debug } = h
  const { args = {}, gid } = state
  const { submitDelay } = args
  const orders = generateOrders(state)

  orders.forEach(o => {
    debug('executing order %s %f @ %f', o.type, o.amount, o.price)
  })

  emit('exec:order:submit:all', gid, orders, submitDelay)

  /*
  let nextState = state

  for (let i = 0; i < orders.length; i += 1) {
    let nextState = submitOrderWithDelay(nextState, submitDelay, o)
  }

  return nextState
  */
}
