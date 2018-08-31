'use strict'

const _isFinite = require('lodash/isFinite')
const hasOBTarget = require('../util/has_ob_target')
const hasTradeTarget = require('../util/has_trade_target')

module.exports = (instance = {}, host) => {
  const { state = {}, h = {} } = instance
  const { args = {} } = state
  const { subscribeChannel } = h
  const { symbol, priceTarget } = args

  if (!_isFinite(priceTarget)) {
    return
  }

  if (hasTradeTarget(args)) {
    subscribeChannel(host, 'trades', { symbol })
  } else if (hasOBTarget(args)) {
    subscribeChannel(host, 'book', { symbol })
  }
}
