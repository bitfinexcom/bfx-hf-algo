'use strict'

const { Order } = require('bfx-api-node-models')
const _isFinite = require('lodash/isFinite')
const _isString = require('lodash/isString')
const _isUndefined = require('lodash/isUndefined')
const Config = require('../config')
const validationErrObj = require('../../util/validate_params_err')

/**
 * Verifies that a parameters Object is valid, and all parameters are within
 * the configured boundaries for a valid TWAP order.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:TWAP
 * @param {object} args - incoming parameters
 * @param {number} args.amount - total order amount
 * @param {number} args.sliceAmount - individual slice order amount
 * @param {number} [args.amountDistortion] - slice amount distortion in %, default 0
 * @param {number} args.priceDelta - max acceptable distance from price target
 * @param {string} [args.priceCondition] - MATCH_LAST, MATCH_SIDE, MATCH_MID
 * @param {number|string} args.priceTarget - numeric, or OB_SIDE, OB_MID, LAST
 * @param {boolean} args.tradeBeyondEnd - if true, slices are not cancelled after their interval expires
 * @param {string} args.orderType - LIMIT or MARKET
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
    orderType, amount, sliceAmount, sliceInterval, amountDistortion, priceTarget, priceCondition,
    priceDelta, lev, _futures
  } = args

  if (!Order.type[orderType]) return validationErrObj('orderType', `Invalid order type: ${orderType}`)
  if (!_isFinite(amount)) return validationErrObj('amount', 'Invalid amount')
  if (!_isFinite(sliceAmount)) return validationErrObj('sliceAmount', 'Invalid slice amount')
  if (!_isFinite(sliceInterval) || sliceInterval <= 0) return validationErrObj('sliceInterval', 'Invalid slice interval')
  if (!_isFinite(amountDistortion)) return validationErrObj('amountDistortion', 'Invalid amount distortion')
  if (Math.abs(sliceAmount) > Math.abs(amount)) return validationErrObj('sliceAmount', 'Slice amount cannot be greater than total amount')
  if (!_isString(priceTarget) && !_isFinite(priceTarget)) {
    return validationErrObj('priceTarget', 'Invalid price target')
  } else if (_isFinite(priceTarget) && priceTarget <= 0) {
    return validationErrObj('priceTarget', 'Negative custom price target')
  } else if (_isFinite(priceTarget) && !Config.PRICE_COND[priceCondition]) {
    return validationErrObj('priceTarget', 'Invalid condition for custom price target')
  } else if (_isString(priceTarget) && !Config.PRICE_TARGET[priceTarget]) {
    return validationErrObj('priceTarget', 'Invalid matched price target')
  } else if (!_isUndefined(priceDelta) && !_isFinite(priceDelta)) {
    return validationErrObj('priceDelta', 'Invalid price delta provided')
  }

  if (
    (amount < 0 && sliceAmount >= 0) ||
    (amount > 0 && sliceAmount <= 0)
  ) {
    return validationErrObj('sliceAmount', 'Amount & slice amount must have same sign')
  }

  if (_isFinite(minSize)) {
    if (Math.abs(amount) < minSize) return validationErrObj('amount', `Amount cannot be less than ${minSize}`)
    if (Math.abs(sliceAmount) < minSize) return validationErrObj('sliceAmount', `Slice amount cannot be less than ${minSize}`)
  }

  if (_isFinite(maxSize)) {
    if (Math.abs(amount) > maxSize) return validationErrObj('amount', `Amount cannot be greater than ${maxSize}`)
    if (Math.abs(sliceAmount) > maxSize) return validationErrObj('sliceAmount', `Slice amount cannot be greater than ${maxSize}`)
  }

  if (_futures) {
    if (!_isFinite(lev)) return validationErrObj('lev', 'Invalid leverage')
    if (lev < 1) return validationErrObj('lev', 'Leverage cannot be less than 1')
    if (_isFinite(maxLev) && (lev > maxLev)) return validationErrObj('lev', `Leverage cannot be greater than ${maxLev}`)
  }

  return null
}

module.exports = validateParams
