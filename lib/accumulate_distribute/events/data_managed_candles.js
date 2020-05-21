'use strict'

const _reverse = require('lodash/reverse')
const hasIndicatorOffset = require('../util/has_indicator_offset')
const hasIndicatorCap = require('../util/has_indicator_cap')

/**
 * If the instance has internal indicators, they are either seeded with the
 * initial candle dataset or updated with new candles as they arrive. The
 * candle dataset is saved on the instance state for order generation.
 *
 * @memberOf module:AccumulateDistribute
 * @listens module:bfx-hf-algo.AOHost~event:dataManagedCandles
 * @see module:AccumulateDistribute.hasIndicatorOffset
 * @see module:AccumulateDistribute.hasIndicatorCap
 *
 * @param {module:bfx-hf-algo.AOInstance} instance - AO instance state
 * @param {object[]} candles - array of incoming candles
 * @param {module:bfx-hf-algo.AOHost~EventMetaInformation} meta - source
 *   channel information
 * @returns {Promise} p
 */
const onDataManagedCandles = async (instance = {}, candles, meta) => {
  const { state = {}, h = {} } = instance
  const { args = {}, offsetIndicator, capIndicator } = state
  const { symbol, relativeOffset, relativeCap } = args
  const { debug, updateState } = h
  const { chanFilter } = meta
  const { key } = chanFilter
  const chanSymbol = key.split(':')[2]

  if ((!hasIndicatorOffset(args) && !hasIndicatorCap(args)) || symbol !== chanSymbol) {
    return
  }

  const [lastCandle] = candles

  // Both indicators start with 0 length
  if ((capIndicator && capIndicator.l() === 0) || (offsetIndicator && offsetIndicator.l() === 0)) {
    debug('seeding indicators with %d candle prices', candles.length)

    const orderedCandles = _reverse(candles)
    orderedCandles.forEach((candle) => {
      if (hasIndicatorCap(args)) {
        capIndicator.add(candle[relativeCap.candlePrice])
      }

      if (hasIndicatorOffset(args)) {
        offsetIndicator.add(candle[relativeOffset.candlePrice])
      }
    })
  } else { // add new data point/update data point
    if (hasIndicatorOffset(args)) {
      const price = lastCandle[relativeOffset.candlePrice]

      debug('updating relative offset indicator with candle price %f', price)

      if (!state.lastCandle) {
        offsetIndicator.add(price)
      } else if (state.lastCandle.mts === lastCandle.mts) {
        offsetIndicator.update(price)
      } else {
        offsetIndicator.add(price)
      }
    }

    if (hasIndicatorCap(args)) {
      const price = lastCandle[relativeCap.candlePrice]

      debug('updating relative cap indicator with candle price %f', price)

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

module.exports = onDataManagedCandles
