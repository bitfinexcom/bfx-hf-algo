'use strict'

const generateOrder = require('./generate_order')
const { Config } = require('bfx-api-node-core')
const { DUST } = Config

module.exports = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { args = {}, gid, orders = {} } = state
  const { emit, debug } = h
  const {
    symbol1, symbol2, symbol3, submitDelay,
    order1, order2, order3
  } = args
  const ordersArray = Object.values(orders)

  if (order1.amount > DUST) {
    // order1 not fully filled
    return
  } else {
    // execute order on symbol 2
    if (ordersArray.length === 1) {
      const order = generateOrder(instance, symbol2)
      if (order) {
        await emit('exec:order:submit:all', gid, [order], submitDelay)
      }
    }
  }

  if (order2.amount > DUST) {
    // order2 not fully filled
    return
  } else {
    // execute order on symbol 3
    if (ordersArray.length === 2) {
      const order = generateOrder(instance, symbol3)
      if (order) {
        await emit('exec:order:submit:all', gid, [order], submitDelay)
      }
    }
  }

  if (order3.amount > DUST) {
    // order3 not fully filled
  } else {
    debug(`Triangular ${symbol1}->${symbol2}->${symbol3} arbitrage complete`)
  }
}
