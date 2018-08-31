'use strict'

const hasTradeTarget = require('../util/has_trade_target')
const hasOBTarget = require('../util/has_ob_target')

module.exports = async (instance = {}, host) => {
  const { h = {}, state = {} } = instance
  const { args = {} } = state
  const { symbol, priceTarget } = args
  const { declareChannel } = h

  if (hasTradeTarget(args)) {
    await declareChannel(instance, host, 'trades', { symbol })
  } else if (hasOBTarget(args)) {
    await declareChannel(instance, host, 'book', {
      symbol,
      prec: 'R0',
      len: '25'
    })
  } else {
    throw new Error('invalid price target %s', priceTarget)
  }
}
