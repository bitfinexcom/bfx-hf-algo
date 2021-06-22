'use strict'

const _isFinite = require('lodash/isFinite')
const _includes = require('lodash/includes')
const validationErrObj = require('../../util/validate_params_err')

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
    stopPrice, ocoAmount, lev, _futures, action, ocoAction
  } = args

  if (!_includes(ORDER_TYPES, orderType)) return validationErrObj('orderType', `Invalid order type: ${orderType}`)
  if (!_isFinite(amount) || amount === 0) return validationErrObj('amount', 'Invalid amount')
  if (orderType === 'LIMIT' && !_isFinite(orderPrice)) {
    return validationErrObj('orderPrice', 'Limit price required for LIMIT order type')
  }

  if (!_isFinite(limitPrice)) return validationErrObj('limitPrice', 'Invalid OCO limit price')
  if (!_isFinite(stopPrice)) return validationErrObj('stopPrice', 'Invalid OCO stop price')
  if (!_isFinite(ocoAmount) || ocoAmount === 0) return validationErrObj('ocoAmount', 'Invalid OCO amount')

  if (action !== 'Buy' && action !== 'Sell') return validationErrObj('action', `Invalid action: ${action}`)
  if (ocoAction !== 'Buy' && ocoAction !== 'Sell') return validationErrObj('ocoAction', `Invalid OCO action: ${ocoAction}`)

  if (_isFinite(minSize)) {
    if (Math.abs(amount) < minSize) return validationErrObj('amount', `Amount cannot be less than ${minSize}`)
    if (Math.abs(ocoAmount) < minSize) return validationErrObj('ocoAmount', `Slice amount cannot be less than ${minSize}`)
  }

  if (_isFinite(maxSize)) {
    if (Math.abs(amount) > maxSize) return validationErrObj('amount', `Amount cannot be greater than ${maxSize}`)
    if (Math.abs(ocoAmount) > maxSize) return validationErrObj('ocoAmount', `Slice amount cannot be greater than ${maxSize}`)
  }

  if (_futures) {
    if (!_isFinite(lev)) return validationErrObj('lev', 'Invalid leverage')
    if (lev < 1) return validationErrObj('lev', 'Leverage cannot be less than 1')
    if (_isFinite(maxLev) && (lev > maxLev)) return validationErrObj('lev', `Leverage cannot be greater than ${maxLev}`)
  }

  return null
}

module.exports = validateParams
