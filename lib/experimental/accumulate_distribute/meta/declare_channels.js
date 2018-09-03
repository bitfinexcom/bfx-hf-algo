'use strict'

const hasOBOffset = require('../util/has_ob_offset')
const hasTradeOffset = require('../util/has_trade_offset')
const hasIndicatorCap = require('../util/has_indicator_cap')
const hasIndicatorOffset = require('../util/has_indicator_offset')

module.exports = async (instance = {}, host) => {
  const { h = {}, state = {} } = instance
  const { args = {} } = state
  const { symbol, candleTimeFrame } = args
  const { declareChannel } = h

  if (hasTradeOffset(args)) {
    await declareChannel(instance, host, 'trades', { symbol })
  } else if (hasOBOffset(args)) {
    await declareChannel(instance, host, 'book', {
      symbol,
      prec: 'R0',
      len: '25'
    })
  }

  if (hasIndicatorCap(args) || hasIndicatorOffset(args)) {
    await declareChannel(instance, host, 'candles', {
      key: `trade:${candleTimeFrame}:${symbol}`
    })
  }
}
