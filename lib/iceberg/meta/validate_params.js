'use strict'

const { Order } = require('bfx-api-node-models')
const _isFinite = require('lodash/isFinite')

module.exports = (args = {}) => {
  const {
    price, amount, sliceAmount, orderType, submitDelay, cancelDelay, lev,
    _futures
  } = args

  if (!Order.type[orderType]) return `Invalid order type: ${orderType}`
  if (!_isFinite(amount)) return 'Invalid amount'
  if (!_isFinite(sliceAmount)) return 'Invalid slice amount'
  if (!_isFinite(submitDelay) || submitDelay < 0) return 'Invalid submit delay'
  if (!_isFinite(cancelDelay) || cancelDelay < 0) return 'Invalid cancel delay'
  if ((orderType.indexOf('MARKET') === -1) && (isNaN(price) || price <= 0)) {
    return 'Invalid price'
  }

  if (
    (amount < 0 && sliceAmount >= 0) ||
    (amount > 0 && sliceAmount <= 0)
  ) {
    return 'Amount & slice amount must have same sign'
  }

  if (_futures) {
    if (!_isFinite(lev)) return 'Invalid leverage'
    if (lev < 1) return 'Leverage less than 1'
    if (lev > 100) return 'Leverage greater than 100'
  }

  return null
}
