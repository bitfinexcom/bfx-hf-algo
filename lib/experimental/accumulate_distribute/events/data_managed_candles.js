'use strict'

const _reverse = require('lodash/reverse')
const hasIndicatorOffset = require('../util/has_indicator_offset')
const hasIndicatorCap = require('../util/has_indicator_cap')

module.exports = async (instance = {}, candles, meta) => {
  const { state = {}, h = {} } = instance
  const { args = {}, offsetIndicator, capIndicator } = state
  const { symbol, candlePrice } = args
  const { debug, updateState } = h
  const { chanFilter } = meta
  const { key } = chanFilter
  const chanSymbol = key.split(':')[2]

  if ((!hasIndicatorOffset(args) && !hasIndicatorCap(args)) || symbol !== chanSymbol) {
    return
  }

  const [ lastCandle ] = candles

  // Both indicators start with 0 length
  if ((capIndicator && capIndicator.l() === 0) || (offsetIndicator && offsetIndicator.l() === 0)) {
    debug('seeding indicators with %d candle prices', candles.length)

    const orderedCandles = _reverse(candles)
    orderedCandles.forEach((candle) => {
      if (hasIndicatorCap(args)) {
        capIndicator.add(candle[candlePrice])
      }

      if (hasIndicatorOffset(args)) {
        offsetIndicator.add(candle[candlePrice])
      }
    })
  } else { // add new data point/update data point
    const price = lastCandle[candlePrice]

    debug('updating indicators with candle price %f [%j]', price, lastCandle)

    if (hasIndicatorOffset(args)) {
      if (!state.lastCandle) {
        offsetIndicator.add(price)
      } else if (state.lastCandle.mts === lastCandle.mts) {
        offsetIndicator.update(price)
      } else {
        offsetIndicator.add(price)
      }
    }

    if (hasIndicatorCap(args)) {
      if (!state.lastCandle) {
        capIndicator.add(price)
      } else if (state.lastCandle.mts === lastCandle.mts) {
        capIndicator.update(price)
      } else {
        capIndicator.add(price)
      }
    }
  }

  await updateState(instance, { candles })
}
