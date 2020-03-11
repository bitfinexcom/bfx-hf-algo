'use strict'

const _isFinite = require('lodash/isFinite')
const _includes = require('lodash/includes')
const { Order } = require('bfx-api-node-models')
const { TIME_FRAMES } = require('bfx-hf-util')

const ORDER_TYPES = Object.values(Order.type)
const TIME_FRAME_LIST = Object.values(TIME_FRAMES)

/**
 * Verifies that a parameters Object is valid, and all parameters are within
 * the configured boundaries for a valid OOCC order.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:OOCC
 * @param {object} args - incoming parameters
 * @param {string} args.orderType - initial order type, LIMIT or MARKET
 * @param {number} args.orderPrice - price for initial order if `orderType` is LIMIT
 * @param {number} args.amount - initial order amount
 * @param {string} args.action - initial order direction, Buy or Sell
 * @param {number} args.stopPriceStopLimit - stop-limit order stop price
 * @param {number} args.stopPriceOCO - OCO order stop price
 * @param {number} args.submitDelay - submit delay in seconds
 * @param {number} args.lev - desired leverage
 * @param {boolean} args._futures - desired leverage
 * @param {number} args.distance - distance for trailing stop orders
 * @param {boolean} args.oco - creates an order-cancels-order pair
 * @param {number} args.tif - expiry timestamp for the order
 * @returns {string} error - null if parameters are valid, otherwise a
 *   description of which parameter is invalid.
 */
const validateParams = (args = {}) => {
  const {
    orderPrice, amount, orderType, submitDelay, stopPriceStopLimit, lev,
    _futures, action, distance, tif, oco, candleTF, stopPriceOCO
  } = args

  if (!_includes(ORDER_TYPES, orderType)) return `Invalid order type: ${orderType}`
  if (!_isFinite(amount)) return 'Invalid amount'
  if (!_isFinite(submitDelay) || submitDelay < 0) return 'Invalid submit delay'
  if (!(/MARKET/.test(orderType)) && !_isFinite(orderPrice)) {
    return 'Limit price required for non-MARKET orders'
  }

  if (!_includes(TIME_FRAME_LIST, candleTF)) return 'Invalid candle time frame'

  if (oco && !_isFinite(stopPriceOCO)) return 'Stop price required for OCO'
  if (
    ((orderType === Order.type.STOP_LIMIT) ||
    (orderType === Order.type.EXCHANGE_STOP_LIMIT)) && !_isFinite(stopPriceStopLimit)
  ) {
    return 'Stop price required for STOP-LIMIT orders'
  }

  if (
    ((orderType === Order.type.TRAILING_STOP) ||
    (orderType === Order.type.EXCHANGE_TRAILING_STOP)) && !_isFinite(distance)
  ) {
    return 'Trailiing distance required for TRAILING-STOP orders'
  }

  if (_isFinite(tif) && (tif < Date.now())) return 'Invalid TIF provided'

  if (action !== 'Buy' && action !== 'Sell') return `Invalid action: ${action}`

  if (_futures) {
    if (!_isFinite(lev)) return 'Invalid leverage'
    if (lev < 1) return 'Leverage less than 1'
    if (lev > 100) return 'Leverage greater than 100'
  }

  return null
}

module.exports = validateParams
