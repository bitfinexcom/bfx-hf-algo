'use strict'

const { Order } = require('bfx-api-node-models')
const _isFinite = require('lodash/isFinite')
const _includes = require('lodash/includes')
const validationErrObj = require('../../util/validate_params_err')

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
  const { price, amount, sliceAmount, orderType, lev, _futures } = args

  if (!Order.type[orderType]) return validationErrObj('orderType', `Invalid order type: ${orderType}`)
  if (!_isFinite(amount)) return validationErrObj('amount', 'Invalid amount')
  if (!_isFinite(sliceAmount)) return validationErrObj('sliceAmount', 'Invalid slice amount')
  if (!_includes(orderType, 'MARKET') && (isNaN(price) || price <= 0)) {
    return validationErrObj('price', 'Invalid price')
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
