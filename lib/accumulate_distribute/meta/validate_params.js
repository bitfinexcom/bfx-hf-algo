'use strict'

const { TIME_FRAME_WIDTHS } = require('bfx-hf-util')
const _isFinite = require('lodash/isFinite')
const _isObject = require('lodash/isObject')
const _isBoolean = require('lodash/isBoolean')
const _includes = require('lodash/includes')
const validationErrObj = require('../../util/validate_params_err')

const ORDER_TYPES = ['MARKET', 'LIMIT', 'RELATIVE']

/**
 * Verifies that a parameters Object is valid, and all parameters are within
 * the configured boundaries for a valid AccumulateDistribute order.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:AccumulateDistribute
 * @param {object} args - incoming parameters
 * @param {number} args.amount - total order amount
 * @param {number} args.sliceAmount - individual slice order amount
 * @param {number} args.sliceInterval - delay in ms between slice orders
 * @param {number} [args.intervalDistortion] - slice interval distortion in %, default 0
 * @param {number} [args.amountDistortion] - slice amount distortion in %, default 0
 * @param {string} args.orderType - LIMIT, MARKET, RELATIVE
 * @param {number} [args.limitPrice] - price for LIMIT orders
 * @param {boolean} args.catchUp - if true, interval will be ignored if behind with filling slices
 * @param {boolean} args.awaitFill - if true, slice orders will be kept open until filled
 * @param {object} [args.relativeOffset] - price reference for RELATIVE orders
 * @param {string} [args.relativeOffset.type] - ask, bid, mid, last, ma, or ema
 * @param {number} [args.relativeOffset.delta] - offset distance from price reference
 * @param {number[]} [args.relativeOffset.args] - MA or EMA indicator arguments [period]
 * @param {string} [args.relativeOffset.candlePrice] - 'open', 'high', 'low', 'close' for MA or EMA indicators
 * @param {string} [args.relativeOffset.candleTimeFrame] - '1m', '5m', '1D', etc, for MA or EMA indicators
 * @param {object} [args.relativeCap] - maximum price reference for RELATIVE orders
 * @param {string} [args.relativeCap.type] - ask, bid, mid, last, ma, or ema
 * @param {number} [args.relativeCap.delta] - cap distance from price reference
 * @param {number[]} [args.relativeCap.args] - MA or EMA indicator arguments [period]
 * @param {string} [args.relativeCap.candlePrice] - 'open', 'high', 'low', 'close' for MA or EMA indicators
 * @param {string} [args.relativeCap.candleTimeFrame] - '1m', '5m', '1D', etc, for MA or EMA indicators
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
    limitPrice, amount, sliceAmount, orderType,
    intervalDistortion, amountDistortion, sliceInterval, relativeOffset,
    relativeCap, catchUp, awaitFill, lev, _futures
  } = args

  if (!_includes(ORDER_TYPES, orderType)) return validationErrObj('orderType', `Invalid order type: ${orderType}`)
  if (!_isFinite(amount) || amount === 0) return validationErrObj('amount', 'Invalid amount')
  if (!_isFinite(sliceAmount) || sliceAmount === 0) return validationErrObj('sliceAmount', 'Invalid slice amount')
  if (!_isBoolean(catchUp)) return validationErrObj('catchUp', 'Bool catch up flag required')
  if (!_isBoolean(awaitFill)) return validationErrObj('awaitFill', 'Bool await fill flag required')
  if (!_isFinite(sliceInterval) || sliceInterval <= 0) return validationErrObj('sliceInterval', 'Invalid slice interval')
  if (!_isFinite(intervalDistortion)) return validationErrObj('intervalDistortion', 'Invalid interval distortion')
  if (!_isFinite(amountDistortion)) return validationErrObj('amountDistortion', 'Invalid amount distortion')

  if (
    (amount < 0 && sliceAmount >= 0) ||
    (amount > 0 && sliceAmount <= 0)
  ) {
    return validationErrObj('sliceAmount', 'Amount & slice amount must have same sign')
  }

  if (Math.abs(sliceAmount) > Math.abs(amount)) {
    return validationErrObj('sliceAmount', 'Slice amount cannot be greater than amount')
  }

  if (orderType === 'LIMIT' && !_isFinite(limitPrice)) {
    return validationErrObj('limitPrice', 'Limit price required for LIMIT order type')
  }

  if (_isObject(relativeCap)) {
    if (!_isFinite(relativeCap.delta)) {
      return validationErrObj('capDelta', 'Invalid relative cap delta')
    }

    if ((relativeCap.type === 'ma') || (relativeCap.type === 'ema')) {
      const { args = [], type } = relativeCap
      const capitalizedType = type.toUpperCase()

      if (args.length !== 1) {
        return validationErrObj(`capIndicatorPeriod${capitalizedType}`, `${capitalizedType} period required for relative cap indicator`)
      } else if (!_isFinite(args[0])) {
        return validationErrObj(`capIndicatorPeriod${capitalizedType}`, `Invalid relative cap indicator period: ${relativeCap.args[0]}`)
      } else if (args[0] <= 0) {
        return validationErrObj(`capIndicatorPeriod${capitalizedType}`, 'Invalid relative cap indicator period, please set a positive value')
      }

      if (!relativeCap.candlePrice) {
        return validationErrObj(`capIndicatorPrice${capitalizedType}`, 'Candle price required for relative cap indicator')
      } else if (!relativeCap.candleTimeFrame) {
        return validationErrObj(`capIndicatorTF${capitalizedType}`, 'Candle time frame required for relative cap indicator')
      } else if (!TIME_FRAME_WIDTHS[relativeCap.candleTimeFrame]) {
        return validationErrObj(`capIndicatorTF${capitalizedType}`, `Unrecognized relative cap candle time frame: ${relativeCap.candleTimeFrame}`)
      }
    }
  }

  if (_isObject(relativeOffset)) {
    if (!_isFinite(relativeOffset.delta)) {
      return validationErrObj('offsetDelta', 'Invalid relative offset delta')
    }

    if ((relativeOffset.type === 'ma') || (relativeOffset.type === 'ema')) {
      const { args = [], type } = relativeOffset
      const capitalizedType = type.toUpperCase()

      if (args.length !== 1) {
        return validationErrObj(`offsetIndicatorPeriod${capitalizedType}`, `${capitalizedType} period required for relative offset indicator`)
      } else if (!_isFinite(args[0])) {
        return validationErrObj(`offsetIndicatorPeriod${capitalizedType}`, `Invalid relative offset indicator period: ${relativeOffset.args[0]}`)
      } else if (args[0] <= 0) {
        return validationErrObj(`offsetIndicatorPeriod${capitalizedType}`, 'Invalid relative offset indicator period, please set a positive value')
      }

      if (!relativeOffset.candlePrice) {
        return validationErrObj(`offsetIndicatorPrice${capitalizedType}`, 'Candle price required for relative offset indicator')
      } else if (!relativeOffset.candleTimeFrame) {
        return validationErrObj(`offsetIndicatorTF${capitalizedType}`, 'Candle time frame required for relative offset indicator')
      } else if (!TIME_FRAME_WIDTHS[relativeOffset.candleTimeFrame]) {
        return validationErrObj(`offsetIndicatorTF${capitalizedType}`, `Unrecognized relative offset candle time frame: ${relativeOffset.candleTimeFrame}`)
      }
    }
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
