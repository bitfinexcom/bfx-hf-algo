'use strict'

const { TIME_FRAMES } = require('bfx-hf-util')

module.exports = (data) => {
  const params = { ...data }

  if (params._symbol) {
    params.symbol = params._symbol
    delete params._symbol
  }

  if (!params.cancelDelay) {
    params.cancelDelay = 1500
  }

  if (!params.submitDelay) {
    params.submitDelay = 5000
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

    if (params.offsetType === 'MA') {
      params.relativeOffset.candlePrice = params.offsetIndicatorPriceMA.toLowerCase()
      params.relativeOffset.candleTimeFrame = TIME_FRAMES[params.offsetIndicatorTFMA]
      params.relativeOffset.args = [+params.offsetIndicatorPeriodMA]
    } else if (params.offsetType === 'EMA') {
      params.relativeOffset.candlePrice = params.offsetIndicatorPriceEMA.toLowerCase()
      params.relativeOffset.candleTimeFrame = TIME_FRAMES[params.offsetIndicatorTFEMA]
      params.relativeOffset.args = [+params.offsetIndicatorPeriodEMA]
    }

    if (params.capType === 'MA') {
      params.relativeCap.candlePrice = params.capIndicatorPriceMA.toLowerCase()
      params.relativeCap.candleTimeFrame = TIME_FRAMES[params.capIndicatorTFMA]
      params.relativeCap.args = [+params.capIndicatorPeriodMA]
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
