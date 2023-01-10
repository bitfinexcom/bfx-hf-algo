'use strict'

const _isFinite = require('lodash/isFinite')
const _includes = require('lodash/includes')
const _isBoolean = require('lodash/isBoolean')
const validationErrObj = require('../../util/validate_params_err')
const { apply: applyI18N } = require('../../util/i18n')

const ORDER_TYPES = ['MARKET', 'LIMIT']

/**
 * Verifies that a parameters Object is valid, and all parameters are within
 * the configured boundaries for a valid Bracket order.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:Bracket
 * @param {object} args - incoming parameters
 * @param {string} args.symbol - symbol to trade on
 * @param {string} args.orderType - initial order type, LIMIT or MARKET
 * @param {number} args.orderPrice - price for initial order if `orderType` is LIMIT
 * @param {number} args.amount - initial order amount
 * @param {string} args.action - initial order direction, Buy or Sell
 * @param {number} args.limitPrice - oco order limit price
 * @param {number} args.stopPrice - oco order stop price
 * @param {number} args.ocoAmount - oco order amount
 * @param {string} args.ocoAction - oco order direction, Buy or Sell
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
    orderPrice, amount, orderType, limitPrice,
    stopPrice, ocoAmount, lev, _futures, action, ocoAction,
    hidden, visibleOnHit
  } = args

  if (!_isBoolean(hidden)) {
    return applyI18N(
      validationErrObj('hidden', 'Bool hidden flag required'),
      'boolHiddenFlagRequired'
    )
  }

  if (hidden && !_isBoolean(visibleOnHit)) {
    return applyI18N(
      validationErrObj('visibleOnHit', 'Bool visible on hit flag required'),
      'boolVisibleOnHitFlagRequired'
    )
  }

  if (!_includes(ORDER_TYPES, orderType)) {
    return applyI18N(
      validationErrObj('orderType', `Invalid order type: ${orderType}`),
      'invalidOrderType', { orderType }
    )
  }
  if (!_isFinite(amount) || amount === 0) {
    return applyI18N(
      validationErrObj('amount', 'Invalid amount'),
      'invalidAmount'
    )
  }
  if (orderType === 'LIMIT' && !_isFinite(orderPrice)) {
    return applyI18N(
      validationErrObj('orderPrice', 'Limit price required for LIMIT order type'),
      'limitPriceRequiredForLimitOrderType'
    )
  }

  if (!_isFinite(limitPrice)) {
    return applyI18N(
      validationErrObj('limitPrice', 'Invalid OCO limit price'),
      'invalidOcoLimitPrice'
    )
  }
  if (!_isFinite(stopPrice)) {
    return applyI18N(
      validationErrObj('stopPrice', 'Invalid OCO stop price'),
      'invalidOcoStopPrice'
    )
  }
  if (!_isFinite(ocoAmount) || ocoAmount === 0) {
    return applyI18N(
      validationErrObj('ocoAmount', 'Invalid OCO amount'),
      'invalidOcoAmount'
    )
  }

  if (action !== 'buy' && action !== 'sell') {
    return applyI18N(
      validationErrObj('action', `Invalid action: ${action}`),
      'invalidAction', { action }
    )
  }
  if (ocoAction !== 'buy' && ocoAction !== 'sell') {
    return applyI18N(
      validationErrObj('ocoAction', `Invalid OCO action: ${ocoAction}`),
      'invalidOcoAction', { ocoAction }
    )
  }

  if (_isFinite(minSize)) {
    if (Math.abs(amount) < minSize) {
      return applyI18N(
        validationErrObj('amount', `Amount cannot be less than ${minSize}`),
        'amountCannotBeLessThan', { minSize }
      )
    }
    if (Math.abs(ocoAmount) < minSize) {
      return applyI18N(
        validationErrObj('ocoAmount', `Slice amount cannot be less than ${minSize}`),
        'sliceAmountCannotBeLessThan', { minSize }
      )
    }
  }

  if (_isFinite(maxSize)) {
    if (Math.abs(amount) > maxSize) {
      return applyI18N(
        validationErrObj('amount', `Amount cannot be greater than ${maxSize}`),
        'amountCannotBeGreaterThan', { maxSize }
      )
    }
    if (Math.abs(ocoAmount) > maxSize) {
      return applyI18N(
        validationErrObj('ocoAmount', `Slice amount cannot be greater than ${maxSize}`),
        'sliceAmountCannotBeGreaterThan', { maxSize }
      )
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
