'use strict'

const _isFinite = require('lodash/isFinite')
const { doesPairExist, doesCcyExist } = require('../util/symbols')
const { ORDER_TYPES } = require('../util/constants')

module.exports = (args = {}) => {
  const {
    symbol1, symbol2, symbol3, amount, orderType1, orderType2, orderType3, submitDelay,
    intermediateCcy, cancelDelay, lev, _futures
  } = args

  if (ORDER_TYPES.indexOf(orderType1) === -1) return `Invalid order type: ${orderType1}`
  if (ORDER_TYPES.indexOf(orderType2) === -1) return `Invalid order type: ${orderType2}`
  if (ORDER_TYPES.indexOf(orderType3) === -1) return `Invalid order type: ${orderType3}`
  if (!_isFinite(amount)) return 'Invalid amount'
  if (!_isFinite(submitDelay) || submitDelay < 0) return 'Invalid submit delay'
  if (!_isFinite(cancelDelay) || cancelDelay < 0) return 'Invalid cancel delay'

  if (!doesCcyExist(intermediateCcy)) return `Invalid intermediate currency ${intermediateCcy}`
  if (!doesPairExist(symbol1)) return `Invalid starting symbol ${symbol1}`
  if (!doesPairExist(symbol2)) return `Invalid intermediate symbol ${symbol2}`
  if (!doesPairExist(symbol3)) return `Invalid final symbol ${symbol3}`

  if (_futures) {
    if (!_isFinite(lev)) return 'Invalid leverage'
    if (lev < 1) return 'Leverage less than 1'
    if (lev > 100) return 'Leverage greater than 100'
  }

  return null
}
