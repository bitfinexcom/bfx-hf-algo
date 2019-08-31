'use strict'

const _isFinite = require('lodash/isFinite')
const _isObject = require('lodash/isObject')

const ORDER_TYPES = ['MARKET', 'LIMIT']

module.exports = (args = {}) => {
  const {
    orderPrice, amount, orderType, submitDelay, cancelDelay, long, short
  } = args

  if (ORDER_TYPES.indexOf(orderType) === -1) return `Invalid order type: ${orderType}`
  if (!_isFinite(amount)) return 'Invalid amount'
  if (!_isFinite(submitDelay) || submitDelay < 0) return 'Invalid submit delay'
  if (!_isFinite(cancelDelay) || cancelDelay < 0) return 'Invalid cancel delay'
  if (orderType === 'LIMIT' && !_isFinite(orderPrice)) {
    return 'Limit price required for LIMIT order type'
  }

  if (!_isObject(long)) return 'Invalid long indicator config'
  if (long.args.length !== 1) return 'Invalid args for long ma indicator '
  if (!long.candlePrice) return 'Candle price required for long indicator'
  if (!long.candleTimeFrame) return 'Candle time frame required for long indicator'
  if (!_isFinite(long.args[0])) return `Invalid long indicator period: ${long.args[0]}`

  if (!_isObject(short)) return 'Invalid short indicator config'
  if (short.args.length !== 1) return 'Invalid args for short ma indicator '
  if (!short.candlePrice) return 'Candle price required for short indicator'
  if (!short.candleTimeFrame) return 'Candle time frame required for short indicator'
  if (!_isFinite(short.args[0])) return `Invalid short indicator period: ${short.args[0]}`

  return null
}
