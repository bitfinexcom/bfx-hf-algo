'use strict'

const { Order } = require('bfx-api-node-models')

module.exports = (args = {}) => {
  const {
    algoName, price, amount, sliceAmount, orderType, submitDelay, cancelDelay
  } = args

  if (!algoName) return 'No algo ordername specified'
  if (!Order.type[orderType]) return `Invalid order type: ${orderType}`
  if (isNaN(amount)) return 'Invalid amount'
  if (isNaN(sliceAmount)) return 'Invalid slice amount'
  if (submitDelay < 0) return 'Invalid submit delay'
  if (cancelDelay < 0) return 'Invalid cancel delay'
  if ((orderType.indexOf('MARKET') === -1) && (isNaN(price) || price <= 0)) {
    return 'Invalid price'
  }

  return null
}
