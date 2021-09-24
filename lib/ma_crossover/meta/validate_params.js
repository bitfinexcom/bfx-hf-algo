'use strict'

const _isFinite = require('lodash/isFinite')
const _isObject = require('lodash/isObject')
const _includes = require('lodash/includes')
const validationErrObj = require('../../util/validate_params_err')
const { apply: applyI18N } = require('../../util/i18n')

const ORDER_TYPES = ['MARKET', 'LIMIT']

/**
 * Verifies that a parameters Object is valid, and all parameters are within
 * the configured boundaries for a valid MACrossover order.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:MACrossover
 * @param {object} args - incoming parameters
 * @param {string} args.orderType - LIMIT or MARKET
 * @param {number} args.orderPrice - price for order if `orderType` is LIMIT
 * @param {number} args.amount - total order amount
 * @param {string} args.shortType - MA or EMA
 * @param {string} [args.shortEMATF] - candle time frame for short EMA signal
 * @param {number} [args.shortEMAPeriod] - cadnel period for short EMA signal
 * @param {string} [args.shortEMAPrice] - candle price key for short EMA signal
 * @param {string} [args.shortMATF] - candle time frame for short MA signal
 * @param {number} [args.shortMAPeriod] - cadnel period for short MA signal
 * @param {string} [args.shortMAPrice] - candle price key for short MA signal
 * @param {string} args.longType - MA or EMA
 * @param {string} [args.longEMATF] - candle time frame for long EMA signal
 * @param {number} [args.longEMAPeriod] - cadnel period for long EMA signal
 * @param {string} [args.longEMAPrice] - candle price key for long EMA signal
 * @param {string} [args.longMATF] - candle time frame for long MA signal
 * @param {number} [args.longMAPeriod] - cadnel period for long MA signal
 * @param {string} [args.longMAPrice] - candle price key for long MA signal
 * @param {object} pairConfig - config for the selected market pair
 * @param {number} pairConfig.minSize - minimum order size for the selected market pair
 * @param {number} pairConfig.maxSize - maximum order size for the selected market pair
 * @param {number} pairConfig.lev - leverage allowed for the selected market pair
 * @returns {string} error - null if parameters are valid, otherwise a
 *   description of which parameter is invalid.
 */
const validateParams = (args = {}, pairConfig = {}) => {
  const { minSize, maxSize, lev: maxLev } = pairConfig
  const { orderPrice, amount, orderType, long, short, lev, _futures } = args

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

  if (!_isObject(long)) {
    return applyI18N(
      validationErrObj('longType', 'Invalid long indicator type'),
      'invalidLongIndicatorType'
    )
  }
  if (long.args.length !== 1) {
    return applyI18N(
      validationErrObj(`long${long.type.toUpperCase()}Period`, 'Invalid args for long ma indicator'),
      'invalidArgsForLongMaIndicator'
    )
  }
  if (!_isFinite(long.args[0])) {
    return applyI18N(
      validationErrObj(`long${long.type.toUpperCase()}Period`, `Invalid long indicator period: ${long.args[0]}`),
      'invalidLongIndicatorPeriod', { value: long.args[0] }
    )
  }
  if (long.args[0] <= 0) {
    return applyI18N(
      validationErrObj(`long${long.type.toUpperCase()}Period`, 'Invalid long period, please set a positive value'),
      'invalidLongPeriodPleaseSetAPositiveValue'
    )
  }
  if (!long.candlePrice) {
    return applyI18N(
      validationErrObj(`long${long.type.toUpperCase()}Price`, 'Candle price required for long indicator'),
      'candlePriceRequiredForLongIndicator'
    )
  }
  if (!long.candleTimeFrame) {
    return applyI18N(
      validationErrObj(`long${long.type.toUpperCase()}TF`, 'Candle time frame required for long indicator'),
      'candleTimeFrameRequiredForLongIndicator'
    )
  }

  if (!_isObject(short)) {
    return applyI18N(
      validationErrObj('shortType', 'Invalid short indicator type'),
      'invalidShortIndicatorType'
    )
  }
  if (short.args.length !== 1) {
    return applyI18N(
      validationErrObj(`short${short.type.toUpperCase()}Period`, 'Invalid args for short ma indicator'),
      'invalidArgsForShortMaIndicator'
    )
  }
  if (!_isFinite(short.args[0])) {
    return applyI18N(
      validationErrObj(`short${short.type.toUpperCase()}Period`, `Invalid short indicator period: ${short.args[0]}`),
      'invalidShortIndicatorPeriod', { value: short.args[0] }
    )
  }
  if (short.args[0] <= 0) {
    return applyI18N(
      validationErrObj(`short${short.type.toUpperCase()}Period`, 'Invalid short period, please set a positive value'),
      'invalidShortPeriodPleaseSetAPositiveValue'
    )
  }
  if (!short.candlePrice) {
    return applyI18N(
      validationErrObj(`short${short.type.toUpperCase()}Price`, 'Candle price required for short indicator'),
      'candlePriceRequiredForShortIndicator'
    )
  }
  if (!short.candleTimeFrame) {
    return applyI18N(
      validationErrObj(`short${short.type.toUpperCase()}TF`, 'Candle time frame required for short indicator'),
      'candleTimeFrameRequiredForShortIndicator'
    )
  }

  if (_isFinite(minSize) && Math.abs(amount) < minSize) {
    return applyI18N(
      validationErrObj('amount', `Amount cannot be less than ${minSize}`),
      'amountCannotBeLessThan', { minSize }
    )
  }

  if (_isFinite(maxSize) && Math.abs(amount) > maxSize) {
    return applyI18N(
      validationErrObj('amount', `Amount cannot be greater than ${maxSize}`),
      'amountCannotBeGreaterThan', { maxSize }
    )
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
