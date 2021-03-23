'use strict'

const { Order } = require('bfx-api-node-models')
const _isFinite = require('lodash/isFinite')
const _includes = require('lodash/includes')

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
 * @param {number} [args.submitDelay] - in ms, default 1500
 * @returns {string} error - null if parameters are valid, otherwise a
 *   description of which parameter is invalid.
 */
const validateParams = (args = {}) => {
  const {
    price, amount, sliceAmount, orderType, submitDelay, lev,
    _futures
  } = args

  if (!Order.type[orderType]) return `Invalid order type: ${orderType}`
  if (!_isFinite(amount)) return 'Invalid amount'
  if (!_isFinite(sliceAmount)) return 'Invalid slice amount'
  if (!_isFinite(submitDelay) || submitDelay < 0) return 'Invalid submit delay'
  if (!_includes(orderType, 'MARKET') && (isNaN(price) || price <= 0)) {
    return 'Invalid price'
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

  return null
}

module.exports = validateParams
