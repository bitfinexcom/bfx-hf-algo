'use strict'

const generateOrder = require('../util/generate_order')
const { MARKET } = require('../util/constants')

module.exports = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { emit, debug } = h
  const { args = {}, gid, orders = {} } = state
  const { symbol1, orderType1, submitDelay } = args

  debug('submitting triangular arbitrage')

  if (Object.values(orders).length <= 0 && orderType1 === MARKET) {
    // haven't started arbitrage yet so open initial order
    const order = generateOrder(instance, symbol1)
    if (order) {
      await emit('exec:order:submit:all', gid, [order], submitDelay)
    }
  }
}
