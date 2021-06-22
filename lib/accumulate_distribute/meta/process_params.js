'use strict'

const { TIME_FRAMES } = require('bfx-hf-util')

/**
 * Converts a raw parameters Object received from an UI into a parameters
 * Object which can be used by an AccumulateDistribute instance for execution.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:AccumulateDistribute
 *
 * @param {object} data - raw parameters from an UI
 * @returns {object} parameters - ready to be passed to a fresh instance
 */
const processParams = (data) => {
  const params = { ...data }

  if (params._symbol) {
    params.symbol = params._symbol
    delete params._symbol
  }

  if (!params._futures) {
    delete params.lev
  }

  if (params.sliceIntervalSec) {
    params.sliceInterval = (+params.sliceIntervalSec) * 1000
    delete params.sliceIntervalSec
  }

  if (!params.amountDistortion) {
    params.amountDistortion = 0
  }

  if (!params.intervalDistortion) {
    params.intervalDistortion = 0
  }

  if (params.orderType === 'RELATIVE') {
    params.relativeOffset = {
      type: params.offsetType.toLowerCase(),
      delta: +params.offsetDelta
    }

    params.relativeCap = {
      type: params.capType.toLowerCase(),
      delta: +params.capDelta
    }

    if (params.offsetType === 'SMA') {
      params.relativeOffset.candlePrice = params.offsetIndicatorPriceSMA.toLowerCase()
      params.relativeOffset.candleTimeFrame = TIME_FRAMES[params.offsetIndicatorTFSMA]
      params.relativeOffset.args = [+params.offsetIndicatorPeriodSMA]
    } else if (params.offsetType === 'EMA') {
      params.relativeOffset.candlePrice = params.offsetIndicatorPriceEMA.toLowerCase()
      params.relativeOffset.candleTimeFrame = TIME_FRAMES[params.offsetIndicatorTFEMA]
      params.relativeOffset.args = [+params.offsetIndicatorPeriodEMA]
    }

    if (params.capType === 'SMA') {
      params.relativeCap.candlePrice = params.capIndicatorPriceSMA.toLowerCase()
      params.relativeCap.candleTimeFrame = TIME_FRAMES[params.capIndicatorTFSMA]
      params.relativeCap.args = [+params.capIndicatorPeriodSMA]
    } else if (params.capType === 'EMA') {
      params.relativeCap.candlePrice = params.capIndicatorPriceEMA.toLowerCase()
      params.relativeCap.candleTimeFrame = TIME_FRAMES[params.capIndicatorTFEMA]
      params.relativeCap.args = [+params.capIndicatorPeriodEMA]
    }
  }

  if (params.action) {
    if (params.action === 'Sell') {
      params.amount = (+params.amount) * -1
      params.sliceAmount = (+params.sliceAmount) * -1
    }

    delete params.action
  }

  return params
}

module.exports = processParams
