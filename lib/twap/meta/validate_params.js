'use strict'

const { Order } = require('bfx-api-node-models')
const _isFinite = require('lodash/isFinite')
const _isString = require('lodash/isString')
const _isUndefined = require('lodash/isUndefined')
const Config = require('../config')

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
 * @param {number} [args.submitDelay] - in ms, defaults to 1500
 * @param {number} [args.cancelDelay] - in ms, defaults to 5000
 * @returns {string} error - null if parameters are valid, otherwise a
 *   description of which parameter is invalid.
 */
const validateParams = (args = {}) => {
  const {
    orderType, amount, sliceAmount, sliceInterval, amountDistortion, priceTarget, priceCondition,
    cancelDelay, submitDelay, priceDelta, lev, _futures
  } = args

  let err = null

  if (!Order.type[orderType]) err = 'invalid order type'
  if (!_isFinite(cancelDelay) || cancelDelay < 0) err = 'invalid cancel delay'
  if (!_isFinite(submitDelay) || submitDelay < 0) err = 'invalid submit delay'
  if (!_isFinite(amount)) err = 'invalid amount'
  if (!_isFinite(sliceAmount)) err = 'invalid slice amount'
  if (!_isFinite(sliceInterval)) err = 'slice interval not a number'
  if (!_isFinite(amountDistortion)) return 'Amount distortion required'
  if (Math.abs(sliceAmount) > Math.abs(amount)) return 'Slice amount cannot be greater than total amount'
  if (sliceInterval <= 0) err = 'slice interval <= 0'
  if (!_isString(priceTarget) && !_isFinite(priceTarget)) {
    err = 'invalid price target'
  } else if (_isFinite(priceTarget) && priceTarget <= 0) {
    err = 'negative custom price target'
  } else if (_isFinite(priceTarget) && !Config.PRICE_COND[priceCondition]) {
    err = 'invalid condition for custom price target'
  } else if (_isString(priceTarget) && !Config.PRICE_TARGET[priceTarget]) {
    err = 'invalid matched price target'
  } else if (!_isUndefined(priceDelta) && !_isFinite(priceDelta)) {
    err = 'invalid price delta provided'
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

  return err
}

module.exports = validateParams
