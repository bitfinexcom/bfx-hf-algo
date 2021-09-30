'use strict'

const { Order } = require('bfx-api-node-models')
const _isFinite = require('lodash/isFinite')
const _includes = require('lodash/includes')
const validationErrObj = require('../../util/validate_params_err')
const { apply: applyI18N } = require('../../util/i18n')

/**
 * Verifies that a parameters Object is valid, and all parameters are within
 * the configured boundaries for a valid Icberg order.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:Iceberg
 * @param {object} args - incoming parameters
 * @param {number} args.amount - total order amount
 * @param {number} args.sliceAmount - iceberg slice order amount
 * @param {number} [args.sliceAmountPerc] - optional, slice amount as % of total amount
 * @param {boolean} args.excessAsHidden - whether to submit remainder as a hidden order
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
  const { price, amount, sliceAmount, sliceAmountPerc, orderType, lev, _futures } = args

  if (!Order.type[orderType]) {
    return applyI18N(
      validationErrObj('orderType', `Invalid order type: ${orderType}`),
      'invalidOrderType', { orderType }
    )
  }
  if (!_isFinite(amount)) {
    return applyI18N(
      validationErrObj('amount', 'Invalid amount'),
      'invalidAmount'
    )
  }
  if (!_isFinite(sliceAmount)) {
    return applyI18N(
      validationErrObj('sliceAmount', 'Invalid slice amount'),
      'invalidSliceAmount'
    )
  }
  if (!_includes(orderType, 'MARKET') && (isNaN(price) || price <= 0)) {
    return applyI18N(
      validationErrObj('price', 'Invalid price'),
      'invalidPrice'
    )
  }

  if (
    (amount < 0 && sliceAmount >= 0) ||
    (amount > 0 && sliceAmount <= 0)
  ) {
    return applyI18N(
      validationErrObj('sliceAmount', 'Amount & slice amount must have same sign'),
      'Amount & sliceAmountMustHaveSameSign'
    )
  }

  if (_isFinite(minSize)) {
    if (Math.abs(amount) < minSize) {
      return applyI18N(
        validationErrObj('amount', `Amount cannot be less than ${minSize}`),
        'amountCannotBeLessThan', { minSize }
      )
    }
    if (Math.abs(sliceAmount) < minSize) {
      return applyI18N(
        validationErrObj(
          sliceAmountPerc ? 'sliceAmountPerc' : 'sliceAmount',
          sliceAmountPerc
            ? `Slice percentage makes the slice amount to be less than the minimum order size(i.e. ${minSize})`
            : `Slice amount cannot be less than ${minSize}`
        ),
        sliceAmountPerc ? 'sliceAmountPercCannotBeLessThan' : 'sliceAmountCannotBeLessThan',
        { minSize }
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
    if (Math.abs(sliceAmount) > maxSize) {
      return applyI18N(
        validationErrObj(
          sliceAmountPerc ? 'sliceAmountPerc' : 'sliceAmount',
          sliceAmountPerc
            ? `Slice percentage makes the slice amount to be greater than the maximum order size(i.e. ${maxSize})`
            : `Slice amount cannot be greater than ${maxSize}`
        ),
        sliceAmountPerc ? 'sliceAmountPercCannotBeGreaterThan' : 'sliceAmountCannotBeGreaterThan',
        { maxSize }
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
