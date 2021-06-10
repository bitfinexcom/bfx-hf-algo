'use strict'

const _isFinite = require('lodash/isFinite')
const validationErrObj = require('../../util/validate_params_err')

/**
 * Verifies that a parameters Object is valid, and all parameters are within
 * the configured boundaries for a valid PingPong order.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:PingPong
 * @param {object} args - incoming parameters
 * @param {number} args.amount - individual ping/pong order amount
 * @param {number} args.orderCount - number of ping/pong pairs to create, 1 or more
 * @param {number} [args.pingPrice] - used for a single ping/pong pair
 * @param {number} [args.pongPrice] - used for a single ping/pong pair
 * @param {number} [args.pingMinPrice] - minimum price for ping orders
 * @param {number} [args.pingMaxPrice] - maximum price for ping orders
 * @param {number} [args.pongDistance] - pong offset from ping orders for multiple pairs
 * @param {object} pairConfig - config for the selected market pair
 * @param {number} pairConfig.minSize - minimum order size for the selected market pair
 * @param {number} pairConfig.maxSize - maximum order size for the selected market pair
 * @param {number} pairConfig.lev - leverage allowed for the selected market pair
 * @returns {string} error - null if parameters are valid, otherwise a
 *   description of which parameter is invalid.
 */
const validateParams = (args = {}, pairConfig = {}) => {
  const { minSize, maxSize, lev: maxLev } = pairConfig
  const {
    pingAmount, pongAmount, pingPrice, pongPrice, pingMinPrice, pingMaxPrice,
    orderCount, pongDistance, lev, _futures, splitPingPongAmount
  } = args

  if (!_isFinite(orderCount) || orderCount < 1) {
    return validationErrObj('orderCount', `Invalid order count: ${orderCount}`)
  }

  if (!_isFinite(pingAmount) || pingAmount === 0) {
    return validationErrObj(
      splitPingPongAmount ? 'pingAmount' : 'amount',
      splitPingPongAmount ? 'Invalid ping amount' : 'Invalid amount'
    )
  }

  if (!_isFinite(pongAmount) || pongAmount === 0) {
    return validationErrObj(
      splitPingPongAmount ? 'pongAmount' : 'amount',
      splitPingPongAmount ? 'Invalid pong amount' : 'Invalid amount'
    )
  }

  if (orderCount === 1) {
    if (!_isFinite(pingPrice) || pingPrice <= 0) return validationErrObj('pingPrice', 'Invalid ping price')
    if (!_isFinite(pongPrice) || pongPrice <= 0) return validationErrObj('pongPrice', 'Invalid pong price')
    if (pingAmount > 0 && pongPrice < pingPrice) {
      return validationErrObj('pongPrice', 'Pong price must be greater than ping price for buy orders')
    }
    if (pingAmount < 0 && pongPrice > pingPrice) {
      return validationErrObj('pongPrice', 'Pong price must be less than ping price for sell orders')
    }
  }

  if (orderCount > 1) {
    if (!_isFinite(pingMinPrice) || pingMinPrice <= 0) {
      return validationErrObj('pingMinPrice', `Invalid ping min price: ${pingMinPrice}`)
    }

    if (!_isFinite(pingMaxPrice) || pingMaxPrice <= 0) {
      return validationErrObj('pingMaxPrice', `Invalid ping max price: ${pingMaxPrice}`)
    }

    if (!_isFinite(pongDistance)) {
      return validationErrObj('pongDistance', `Invalid pong distance: ${pongDistance}`)
    }

    if (pingMaxPrice < pingMinPrice) {
      return validationErrObj('pingMaxPrice', 'Ping max price must be greater than min price')
    }

    if (pongDistance <= 0) {
      return validationErrObj('pongDistance', 'Pong distance must be positive')
    }
  }

  if (_isFinite(minSize)) {
    if (Math.abs(pingAmount) < minSize) {
      return validationErrObj(
        splitPingPongAmount ? 'pingAmount' : 'amount',
        `${splitPingPongAmount ? 'Ping amount' : 'Amount'} cannot be less than ${minSize}`
      )
    }
    if (Math.abs(pongAmount) < minSize) {
      return validationErrObj(
        splitPingPongAmount ? 'pongAmount' : 'amount',
        `${splitPingPongAmount ? 'Pong amount' : 'Amount'} cannot be less than ${minSize}`
      )
    }
  }

  if (_isFinite(maxSize)) {
    if (Math.abs(pingAmount) > maxSize) {
      return validationErrObj(
        splitPingPongAmount ? 'pingAmount' : 'amount',
        `${splitPingPongAmount ? 'Ping amount' : 'Amount'} cannot be greater than ${maxSize}`
      )
    }
    if (Math.abs(pongAmount) > maxSize) {
      return validationErrObj(
        splitPingPongAmount ? 'pongAmount' : 'amount',
        `${splitPingPongAmount ? 'Pong amount' : 'Amount'} cannot be greater than ${maxSize}`
      )
    }
  }

  if (_futures) {
    if (!_isFinite(lev)) return validationErrObj('lev', 'Invalid leverage')
    if (lev < 1) return validationErrObj('lev', 'Leverage cannot be less than 1')
    if (_isFinite(maxLev) && (lev > maxLev)) return validationErrObj('lev', `Leverage cannot be greater than ${maxLev}`)
  }

  return null
}

module.exports = validateParams
