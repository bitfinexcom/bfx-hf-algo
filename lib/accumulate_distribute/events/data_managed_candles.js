'use strict'

const _last = require('lodash/last')
const hasIndicatorOffset = require('../util/has_indicator_offset')
const hasIndicatorCap = require('../util/has_indicator_cap')
const parseChannelKey = require('../../util/parse_channel_key')

/**
 * If the instance has internal indicators, they are either seeded with the
 * initial candle dataset or updated with new candles as they arrive. The
 * candle dataset is saved on the instance state for order generation.
 *
 * @memberOf module:AccumulateDistribute
 * @listens AOHost~event:dataManagedCandles
 * @see module:AccumulateDistribute.hasIndicatorOffset
 * @see module:AccumulateDistribute.hasIndicatorCap
 *
 * @param {AOInstance} instance - AO instance state
 * @param {object[]} candles - array of incoming candles
 * @param {EventMetaInformation} meta - source channel information
 * @returns {Promise} p
 */
const onDataManagedCandles = async (instance = {}, candles, meta) => {
  const { state = {}, h = {} } = instance
  const { args = {}, offsetIndicator, capIndicator } = state
  const { symbol, relativeOffset, relativeCap } = args
  const { debug, updateState } = h
  const { chanFilter } = meta
  const { key } = chanFilter
  const { symbol: chanSymbol, tf: chanTF } = parseChannelKey(key)

  const hasOffsetIndicator = hasIndicatorOffset(args)
  const hasCapIndicator = hasIndicatorCap(args)

  if ((!hasOffsetIndicator && !hasCapIndicator) || symbol !== chanSymbol) {
    return
  }

  const lastCandleUpdateOpts = {}
  let updateLastCandleOffset = true
  let updateLastCandleCap = true

  let [lastCandle] = candles

  if (hasOffsetIndicator && chanTF === relativeOffset.candleTimeFrame) {
    if (!offsetIndicator.isSeeded()) {
      debug('seeding relative offset indicator with %d candle prices', candles.length)

      candles.forEach((candle) => {
        offsetIndicator.add(candle[relativeOffset.candlePrice])
      })
      lastCandle = _last(candles)
    } else {
      const price = lastCandle[relativeOffset.candlePrice]
      debug('updating relative offset indicator with candle price %f(%s)', price, chanSymbol)

      if (!state.lastCandleOffset) {
        offsetIndicator.add(price)
      } else if (state.lastCandleOffset.mts === lastCandle.mts) {
        offsetIndicator.update(price)
      } else if (state.lastCandleOffset.mts > lastCandle.mts) {
        updateLastCandleOffset = false // do nothing
      } else {
        offsetIndicator.add(price)
      }
    }
    if (updateLastCandleOffset) {
      lastCandleUpdateOpts.lastCandleOffset = lastCandle
    }
  }

  if (hasCapIndicator && chanTF === relativeCap.candleTimeFrame) {
    if (!capIndicator.isSeeded()) {
      debug('seeding relative cap indicator with %d candle prices', candles.length)

      candles.forEach((candle) => {
        capIndicator.add(candle[relativeCap.candlePrice])
      })
      lastCandle = _last(candles)
    } else {
      const price = lastCandle[relativeCap.candlePrice]
      debug('updating relative cap indicator with candle price %f(%s)', price, chanSymbol)

      if (!state.lastCandleCap) {
        capIndicator.add(price)
      } else if (state.lastCandleCap.mts === lastCandle.mts) {
        capIndicator.update(price)
      } else if (state.lastCandleCap.mts > lastCandle.mts) {
        updateLastCandleCap = false // do nothing
      } else {
        capIndicator.add(price)
      }
    }
    if (updateLastCandleCap) {
      lastCandleUpdateOpts.lastCandleCap = lastCandle
    }
  }

  if (updateLastCandleOffset || updateLastCandleCap) {
    await updateState(instance, { ...lastCandleUpdateOpts })
  }
}

module.exports = onDataManagedCandles
