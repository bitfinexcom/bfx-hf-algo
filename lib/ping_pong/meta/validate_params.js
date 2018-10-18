'use strict'

const _isFinite = require('lodash/isFinite')

module.exports = (args = {}) => {
  const {
    amount, pingPrice, pongPrice, pingMinPrice, pingMaxPrice, orderCount,
    pongDistance,
  } = args

  if (!_isFinite(orderCount) || orderCount < 1) {
    return `Invalid order count: ${orderCount}`
  }

  if (!_isFinite(amount)) return 'Invalid amount'
  if (amount > 0 && pongPrice < pingPrice && orderCount === 1) {
    return 'Pong price must be greater than ping price for buy orders'
  } else if (amount < 0 && pongPrice > pingPrice && orderCount === 1) {
    return 'Pong price must be less than ping price for sell orders'
  }

  if (orderCount > 1) {
    if (!_isFinite(pingMinPrice)) {
      return `Invalid ping min price: ${pingMinPrice}`
    }

    if (!_isFinite(pingMaxPrice)) {
      return `Invalid ping max price: ${pingMaxPrice}`
    }

    if (!_isFinite(pongDistance)) {
      return `Invalid pong distance: ${pongDistance}`
    }

    if (pingMaxPrice < pingMinPrice) {
      return 'Ping max price must be greater than min price'
    }

    if (pongDistance < 0) {
      return 'Pong distance must be positive'
    }
  }

  return null
}
