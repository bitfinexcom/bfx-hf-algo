'use strict'

const { Order } = require('bfx-api-node-models')
const _isFinite = require('lodash/isFinite')

module.exports = (args = {}) => {
  const {
    price, amount, sliceAmount, orderType, submitDelay, cancelDelay
  } = args

  if (!Order.type[orderType]) return `Invalid order type: ${orderType}`
  if (!_isFinite(amount)) return 'Invalid amount'
  if (!_isFinite(sliceAmount)) return 'Invalid slice amount'
  if (submitDelay < 0) return 'Invalid submit delay'
  if (cancelDelay < 0) return 'Invalid cancel delay'
  if ((orderType.indexOf('MARKET') === -1) && (isNaN(price) || price <= 0)) {
    return 'Invalid price'
  }

  if (
    (amount < 0 && sliceAmount >= 0) ||
    (amount > 0 && sliceAmount <= 0)
  ) {
    return 'Amount & slice amount must have same sign'
  }

  return null
}
