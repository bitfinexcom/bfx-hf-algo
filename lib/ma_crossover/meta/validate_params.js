'use strict'

const _isFinite = require('lodash/isFinite')
const _isObject = require('lodash/isObject')
const _includes = require('lodash/includes')

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
 * @returns {string} error - null if parameters are valid, otherwise a
 *   description of which parameter is invalid.
 */
const validateParams = (args = {}) => {
  const {
    orderPrice, amount, orderType, long, short, lev,
    _futures
  } = args

  if (!_includes(ORDER_TYPES, orderType)) return `Invalid order type: ${orderType}`
  if (!_isFinite(amount) || amount === 0) return 'Invalid amount'
  if (orderType === 'LIMIT' && !_isFinite(orderPrice)) {
    return 'Limit price required for LIMIT order type'
  }

  if (!_isObject(long)) return 'Invalid long indicator config'
  if (long.args.length !== 1) return 'Invalid args for long ma indicator '
  if (long.args[0] <= 0) return 'Invalid long period, please set a positive value'
  if (!long.candlePrice) return 'Candle price required for long indicator'
  if (!long.candleTimeFrame) return 'Candle time frame required for long indicator'
  if (!_isFinite(long.args[0])) return `Invalid long indicator period: ${long.args[0]}`

  if (!_isObject(short)) return 'Invalid short indicator config'
  if (short.args.length !== 1) return 'Invalid args for short ma indicator '
  if (short.args[0] <= 0) return 'Invalid short period, please set a positive value'
  if (!short.candlePrice) return 'Candle price required for short indicator'
  if (!short.candleTimeFrame) return 'Candle time frame required for short indicator'
  if (!_isFinite(short.args[0])) return `Invalid short indicator period: ${short.args[0]}`

  if (_futures) {
    if (!_isFinite(lev)) return 'Invalid leverage'
    if (lev < 1) return 'Leverage less than 1'
    if (lev > 100) return 'Leverage greater than 100'
  }

  return null
}

module.exports = validateParams
