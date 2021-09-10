'use strict'

const _isFinite = require('lodash/isFinite')
const validationErrObj = require('../../util/validate_params_err')
const { apply: applyI18N } = require('../../util/i18n')

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
    return applyI18N(
      validationErrObj('orderCount', `Invalid order count: ${orderCount}`),
      'invalidOrderCount', { orderCount }
    )
  }

  if (!_isFinite(pingAmount) || pingAmount === 0) {
    return applyI18N(validationErrObj(
      splitPingPongAmount ? 'pingAmount' : 'amount',
      splitPingPongAmount ? 'Invalid ping amount' : 'Invalid amount'
    ), splitPingPongAmount ? 'invalidPingAmount' : 'invalidAmount')
  }

  if (!_isFinite(pongAmount) || pongAmount === 0) {
    return applyI18N(validationErrObj(
      splitPingPongAmount ? 'pongAmount' : 'amount',
      splitPingPongAmount ? 'Invalid pong amount' : 'Invalid amount'
    ), splitPingPongAmount ? 'invalidPongAmount' : 'invalidAmount')
  }

  if (orderCount === 1) {
    if (!_isFinite(pingPrice) || pingPrice <= 0) {
      return applyI18N(
        validationErrObj('pingPrice', 'Invalid ping price'),
        'invalidPingPrice'
      )
    }
    if (!_isFinite(pongPrice) || pongPrice <= 0) {
      return applyI18N(
        validationErrObj('pongPrice', 'Invalid pong price'),
        'invalidPongPrice'
      )
    }
    if (pingAmount > 0 && pongPrice < pingPrice) {
      return applyI18N(
        validationErrObj('pongPrice', 'Pong price must be greater than ping price for buy orders'),
        'pongPriceMustBeGreaterThanPingForBuyOrders'
      )
    }
    if (pingAmount < 0 && pongPrice > pingPrice) {
      return applyI18N(
        validationErrObj('pongPrice', 'Pong price must be less than ping price for sell orders'),
        ['pongPriceMustBeLessThanPingForSellOrders']
      )
    }
  }

  if (orderCount > 1) {
    if (!_isFinite(pingMinPrice) || pingMinPrice <= 0) {
      return applyI18N(
        validationErrObj('pingMinPrice', `Invalid ping min price: ${pingMinPrice}`),
        'invalidPingMinPrice', { pingMinPrice }
      )
    }

    if (!_isFinite(pingMaxPrice) || pingMaxPrice <= 0) {
      return applyI18N(
        validationErrObj('pingMaxPrice', `Invalid ping max price: ${pingMaxPrice}`),
        'invalidPingMaxPrice', { pingMaxPrice }
      )
    }

    if (!_isFinite(pongDistance)) {
      return applyI18N(
        validationErrObj('pongDistance', `Invalid pong distance: ${pongDistance}`),
        'invalidPongDistance', { pongDistance }
      )
    }

    if (pingMaxPrice < pingMinPrice) {
      return applyI18N(
        validationErrObj('pingMaxPrice', 'Ping max price must be greater than min price'),
        'pingMaxPriceGreaterThanMinPrice'
      )
    }

    if (pongDistance <= 0) {
      return applyI18N(
        validationErrObj('pongDistance', 'Pong distance must be positive'),
        'pongDistancePositive'
      )
    }
  }

  if (_isFinite(minSize)) {
    if (Math.abs(pingAmount) < minSize) {
      return applyI18N(validationErrObj(
        splitPingPongAmount ? 'pingAmount' : 'amount',
        `${splitPingPongAmount ? 'Ping amount' : 'Amount'} cannot be less than ${minSize}`
      ), splitPingPongAmount ? 'pingAmountCannotBeLessThan' : 'amountCannotBeLessThan', { minSize })
    }
    if (Math.abs(pongAmount) < minSize) {
      return applyI18N(validationErrObj(
        splitPingPongAmount ? 'pongAmount' : 'amount',
        `${splitPingPongAmount ? 'Pong amount' : 'Amount'} cannot be less than ${minSize}`
      ), splitPingPongAmount ? 'pongAmountCannotBeLessThan' : 'amountCannotBeLessThan', { minSize })
    }
  }

  if (_isFinite(maxSize)) {
    if (Math.abs(pingAmount) > maxSize) {
      return applyI18N(validationErrObj(
        splitPingPongAmount ? 'pingAmount' : 'amount',
        `${splitPingPongAmount ? 'Ping amount' : 'Amount'} cannot be greater than ${maxSize}`
      ), splitPingPongAmount ? 'pingAmountCannotBeGreaterThan' : 'amountCannotBeGreaterThan', { maxSize })
    }
    if (Math.abs(pongAmount) > maxSize) {
      return applyI18N(validationErrObj(
        splitPingPongAmount ? 'pongAmount' : 'amount',
        `${splitPingPongAmount ? 'Pong amount' : 'Amount'} cannot be greater than ${maxSize}`
      ), splitPingPongAmount ? 'pongAmountCannotBeGreaterThan' : 'amountCannotBeGreaterThan', { maxSize })
    }
  }

  if (_futures) {
    if (!_isFinite(lev)) {
      return applyI18N(
        validationErrObj('lev', 'Invalid leverage'),
        'invalidLeverage'
      )
    }
    if (lev < 1) {
      return applyI18N(
        validationErrObj('lev', 'Leverage cannot be less than 1'),
        'leverageCannotBeLessThan', { minLev: 1 }
      )
    }
    if (_isFinite(maxLev) && (lev > maxLev)) {
      return applyI18N(
        validationErrObj('lev', `Leverage cannot be greater than ${maxLev}`),
        'leverageCannotBeGreaterThan', { maxLev }
      )
    }
  }

  return null
}

module.exports = validateParams
