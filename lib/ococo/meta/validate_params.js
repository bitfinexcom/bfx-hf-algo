'use strict'

const _isFinite = require('lodash/isFinite')

const ORDER_TYPES = ['MARKET', 'LIMIT']

module.exports = (args = {}) => {
  const {
    orderPrice, amount, orderType, submitDelay, cancelDelay, limitPrice,
    stopPrice, ocoAmount, lev, _futures, action, ocoAction
  } = args

  if (ORDER_TYPES.indexOf(orderType) === -1) return `Invalid order type: ${orderType}`
  if (!_isFinite(amount)) return 'Invalid amount'
  if (!_isFinite(submitDelay) || submitDelay < 0) return 'Invalid submit delay'
  if (!_isFinite(cancelDelay) || cancelDelay < 0) return 'Invalid cancel delay'
  if (orderType === 'LIMIT' && !_isFinite(orderPrice)) {
    return 'Limit price required for LIMIT order type'
  }

  if (!_isFinite(limitPrice)) return 'Invalid OCO limit price'
  if (!_isFinite(stopPrice)) return 'Invalid OCO stop price'
  if (!_isFinite(ocoAmount)) return 'Invalid OCO amount'

  if (action !== 'Buy' && action !== 'Sell') return `Invalid action: ${action}`
  if (ocoAction !== 'Buy' && ocoAction !== 'Sell') return `Invalid OCO action: ${ocoAction}`

  if (_futures) {
    if (!_isFinite(lev)) return 'Invalid leverage'
    if (lev < 1) return 'Leverage less than 1'
    if (lev > 100) return 'Leverage greater than 100'
  }

  return null
}
