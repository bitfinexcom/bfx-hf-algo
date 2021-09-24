'use strict'

const { TIME_FRAME_WIDTHS } = require('bfx-hf-util')
const _isFinite = require('lodash/isFinite')
const _isObject = require('lodash/isObject')
const _isBoolean = require('lodash/isBoolean')
const _includes = require('lodash/includes')
const validationErrObj = require('../../util/validate_params_err')
const { apply: applyI18N } = require('../../util/i18n')

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
 * @param {string} [args.relativeOffset.type] - ask, bid, mid, last, sma, or ema
 * @param {number} [args.relativeOffset.delta] - offset distance from price reference
 * @param {number[]} [args.relativeOffset.args] - SMA or EMA indicator arguments [period]
 * @param {string} [args.relativeOffset.candlePrice] - 'open', 'high', 'low', 'close' for SMA or EMA indicators
 * @param {string} [args.relativeOffset.candleTimeFrame] - '1m', '5m', '1D', etc, for SMA or EMA indicators
 * @param {object} [args.relativeCap] - maximum price reference for RELATIVE orders
 * @param {string} [args.relativeCap.type] - ask, bid, mid, last, sma, or ema
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
    relativeCap, catchUp, awaitFill, postonly, lev, _futures
  } = args

  if (!_includes(ORDER_TYPES, orderType)) {
    return applyI18N(
      validationErrObj('orderType', `Invalid order type: ${orderType}`),
      'invalidOrderType', { orderType }
    )
  }
  if (!_isFinite(amount) || amount === 0) {
    return applyI18N(
      validationErrObj('amount', 'Invalid amount'),
      'invalidAmount'
    )
  }
  if (!_isFinite(sliceAmount) || sliceAmount === 0) {
    return applyI18N(
      validationErrObj('sliceAmount', 'Invalid slice amount'),
      'invalidSliceAmount'
    )
  }
  if (!_isBoolean(catchUp)) {
    return applyI18N(
      validationErrObj('catchUp', 'Bool catch up flag required'),
      'boolCatchUpFlagRequired'
    )
  }
  if (!_isBoolean(awaitFill)) {
    return applyI18N(
      validationErrObj('awaitFill', 'Bool await fill flag required'),
      'boolAwaitFillFlagRequired'
    )
  }
  if (!_isFinite(sliceInterval) || sliceInterval <= 0) {
    return applyI18N(
      validationErrObj('sliceIntervalSec', 'Invalid slice interval'),
      'invalidSliceInterval'
    )
  }
  if (!_isFinite(intervalDistortion)) {
    return applyI18N(
      validationErrObj('intervalDistortion', 'Invalid interval distortion'),
      'invalidIntervalDistortion'
    )
  }
  if (!_isFinite(amountDistortion)) {
    return applyI18N(
      validationErrObj('amountDistortion', 'Invalid amount distortion'),
      'invalidAmountDistortion'
    )
  }

  if (
    (amount < 0 && sliceAmount >= 0) ||
    (amount > 0 && sliceAmount <= 0)
  ) {
    return applyI18N(
      validationErrObj('sliceAmount', 'Amount & slice amount must have same sign'),
      'amountSliceAmountMustHaveSameSign'
    )
  }

  if (Math.abs(sliceAmount) > Math.abs(amount)) {
    return applyI18N(
      validationErrObj('sliceAmount', 'Slice amount cannot be greater than amount'),
      'sliceAmountCannotBeGreaterThanAmount'
    )
  }

  if (orderType === 'LIMIT' && !_isFinite(limitPrice)) {
    return applyI18N(
      validationErrObj('limitPrice', 'Limit price required for LIMIT order type'),
      'limitPriceRequiredForLimitOrderType'
    )
  }

  if (orderType === 'LIMIT' && !_isBoolean(postonly)) {
    return applyI18N(
      validationErrObj('postonly', 'Post only flag required for LIMIT order type'),
      'postOnlyFlagRequiredForLimitOrderType'
    )
  }

  if (_isObject(relativeCap)) {
    if (!_isFinite(relativeCap.delta)) {
      return applyI18N(
        validationErrObj('capDelta', 'Invalid relative cap delta'),
        'invalidRelativeCapDelta'
      )
    }

    if ((relativeCap.type === 'sma') || (relativeCap.type === 'ema')) {
      const { args = [], type } = relativeCap
      const capitalizedType = type.toUpperCase()

      if (args.length !== 1) {
        return applyI18N(
          validationErrObj(`capIndicatorPeriod${capitalizedType}`, `${capitalizedType} period required for relative cap indicator`),
          'periodRequiredForRelativeCapIndicator', { capitalizedType }
        )
      } else if (!_isFinite(args[0])) {
        return applyI18N(
          validationErrObj(`capIndicatorPeriod${capitalizedType}`, `Invalid relative cap indicator period: ${relativeCap.args[0]}`),
          'invalidRelativeCapIndicatorPeriod', { value: relativeCap.args[0] }
        )
      } else if (args[0] <= 0) {
        return applyI18N(
          validationErrObj(`capIndicatorPeriod${capitalizedType}`, 'Invalid relative cap indicator period, please set a positive value'),
          'invalidRelativeCapIndicatorPeriodPleaseSetAPositiveValue'
        )
      }

      if (!relativeCap.candlePrice) {
        return applyI18N(
          validationErrObj(`capIndicatorPrice${capitalizedType}`, 'Candle price required for relative cap indicator'),
          'candlePriceRequiredForRelativeCapIndicator'
        )
      } else if (!relativeCap.candleTimeFrame) {
        return applyI18N(
          validationErrObj(`capIndicatorTF${capitalizedType}`, 'Candle time frame required for relative cap indicator'),
          'candleTimeFrameRequiredForRelativeCapIndicator'
        )
      } else if (!TIME_FRAME_WIDTHS[relativeCap.candleTimeFrame]) {
        return applyI18N(
          validationErrObj(`capIndicatorTF${capitalizedType}`, `Unrecognized relative cap candle time frame: ${relativeCap.candleTimeFrame}`),
          'unrecognizedRelativeCapCandleTimeFrame', { value: relativeCap.candleTimeFrame }
        )
      }
    }
  }

  if (_isObject(relativeOffset)) {
    if (!_isFinite(relativeOffset.delta)) {
      return applyI18N(
        validationErrObj('offsetDelta', 'Invalid relative offset delta'),
        'invalidRelativeOffsetDelta'
      )
    }

    if ((relativeOffset.type === 'sma') || (relativeOffset.type === 'ema')) {
      const { args = [], type } = relativeOffset
      const capitalizedType = type.toUpperCase()

      if (args.length !== 1) {
        return applyI18N(
          validationErrObj(`offsetIndicatorPeriod${capitalizedType}`, `${capitalizedType} period required for relative offset indicator`),
          'periodRequiredForRelativeOffsetIndicator', { type: capitalizedType }
        )
      } else if (!_isFinite(args[0])) {
        return applyI18N(
          validationErrObj(`offsetIndicatorPeriod${capitalizedType}`, `Invalid relative offset indicator period: ${relativeOffset.args[0]}`),
          'invalidRelativeOffsetIndicatorPeriod', { value: relativeOffset.args[0] }
        )
      } else if (args[0] <= 0) {
        return applyI18N(
          validationErrObj(`offsetIndicatorPeriod${capitalizedType}`, 'Invalid relative offset indicator period, please set a positive value'),
          'invalidRelativeOffsetIndicatorPeriodPleaseSetAPositiveValue'
        )
      }

      if (!relativeOffset.candlePrice) {
        return applyI18N(
          validationErrObj(`offsetIndicatorPrice${capitalizedType}`, 'Candle price required for relative offset indicator'),
          'candlePriceRequiredForRelativeOffsetIndicator'
        )
      } else if (!relativeOffset.candleTimeFrame) {
        return applyI18N(
          validationErrObj(`offsetIndicatorTF${capitalizedType}`, 'Candle time frame required for relative offset indicator'),
          'candleTimeFrameRequiredForRelativeOffsetIndicator'
        )
      } else if (!TIME_FRAME_WIDTHS[relativeOffset.candleTimeFrame]) {
        return applyI18N(
          validationErrObj(`offsetIndicatorTF${capitalizedType}`, `Unrecognized relative offset candle time frame: ${relativeOffset.candleTimeFrame}`),
          'unrecognizedRelativeOffsetCandleTimeFrame', { value: relativeOffset.candleTimeFrame }
        )
      }
    }
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
        validationErrObj('sliceAmount', `Slice amount cannot be less than ${minSize}`),
        'sliceAmountCannotBeLessThan', { minSize }
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
        validationErrObj('sliceAmount', `Slice amount cannot be greater than ${maxSize}`),
        'sliceAmountCannotBeGreaterThan', { maxSize }
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
