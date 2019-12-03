'use strict'

const _isFinite = require('lodash/isFinite')

module.exports = (args = {}) => {
  const {
    pingAmount, pongAmount, pingPrice, pongPrice, pingMinPrice, pingMaxPrice,
    orderCount, pongDistance, lev, _futures
  } = args

  if (!_isFinite(orderCount) || orderCount < 1) {
    return `Invalid order count: ${orderCount}`
  }

  if (!_isFinite(pingAmount) || pingAmount === 0) return 'Invalid ping amount'
  if (!_isFinite(pongAmount) || pongAmount === 0) return 'Invalid pong amount'

  if (pingAmount > 0 && pongPrice < pingPrice && orderCount === 1) {
    return 'Pong price must be greater than ping price for buy orders'
  } else if (pingAmount < 0 && pongPrice > pingPrice && orderCount === 1) {
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

  if (_futures) {
    if (!_isFinite(lev)) return 'Invalid leverage'
    if (lev < 1) return 'Leverage less than 1'
    if (lev > 100) return 'Leverage greater than 100'
  }

  return null
}
