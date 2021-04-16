'use strict'

const _isFinite = require('lodash/isFinite')
const _includes = require('lodash/includes')

const ORDER_TYPES = ['MARKET', 'LIMIT']

/**
 * Verifies that a parameters Object is valid, and all parameters are within
 * the configured boundaries for a valid OCOCO order.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:OCOCO
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
 * @returns {string} error - null if parameters are valid, otherwise a
 *   description of which parameter is invalid.
 */
const validateParams = (args = {}) => {
  const {
    orderPrice, amount, orderType, limitPrice,
    stopPrice, ocoAmount, lev, _futures, action, ocoAction
  } = args

  if (!_includes(ORDER_TYPES, orderType)) return `Invalid order type: ${orderType}`
  if (!_isFinite(amount)) return 'Invalid amount'
  if (orderType === 'LIMIT' && !_isFinite(orderPrice)) {
    return 'Limit price required for LIMIT order type'
  }

  if (!_isFinite(limitPrice)) return 'Invalid OCO limit price'
  if (!_isFinite(stopPrice)) return 'Invalid OCO stop price'
  if (!_isFinite(ocoAmount)) return 'Invalid OCO amount'

  if (action !== 'Buy' && action !== 'Sell') return `Invalid action: ${action}`
  if (ocoAction !== 'Buy' && ocoAction !== 'Sell') return `Invalid OCO action: ${ocoAction}`

  if (_futures) {
    if (!_isFinite(lev)) return 'Invalid leverage'
    if (lev < 1) return 'Leverage less than 1'
    if (lev > 100) return 'Leverage greater than 100'
  }

  return null
}

module.exports = validateParams
