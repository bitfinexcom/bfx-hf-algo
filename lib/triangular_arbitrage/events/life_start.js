'use strict'

const trySubmitOrder = require('../util/try_submit_order')

module.exports = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { debug } = h
  const { args = {} } = state
  const { symbol1, symbol2, symbol3 } = args

  debug(`Triangular ${symbol1}->${symbol2}->${symbol3} arbitrage complete`)
  trySubmitOrder(instance)
}
