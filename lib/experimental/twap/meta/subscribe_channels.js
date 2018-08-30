'use strict'

const Config = require('../config')

module.exports = (instance = {}, host) => {
  const { state = {}, h = {} } = instance
  const { args = {} } = state
  const { subscribeChannel } = h
  const { symbol, priceTarget, priceCondition } = args

  if (!_isFinite(priceTarget)) {
    return
  }

  if (priceCondition === Config.PRICE_COND.MATCH_LAST) {
    subscribeChannel(host, 'trades', { symbol })
  } else if (
    (priceCondition === Config.PRICE_COND.MATCH_SIDE) ||
    (priceCondition === Config.PRICE_COND.MATCH_MIDPOINT)
  ) {
    subscribeChannel(host, 'book', { symbol })
  }
}
