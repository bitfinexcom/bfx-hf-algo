'use strict'

const _isFinite = require('lodash/isFinite')
const _last = require('lodash/last')
const parseChannelKey = require('../../util/parse_channel_key')

/**
 * If the instance has internal indicators, they are either seeded with the
 * initial candle dataset or updated with new candles as they arrive. The
 * candle dataset is saved on the instance state for order generation.
 *
 * Indicator values are calculated, and if they have crossed the configured
 * atomic order is submitted, and the `'exec:stop`' event is emitted to
 * stop execution and trigger teardown.
 *
 * @memberOf module:MACrossover
 * @listens AOHost~dataManagedCandles
 * @param {AOInstance} instance - AO instance
 * @param {object[]} candles - incoming candles
 * @param {EventMetaInformation} meta - source channel information
 * @returns {Promise} p - resolves on completion
 */
const onDataManagedCandles = async (instance = {}, candles, meta) => {
  const { state = {}, h = {} } = instance
  const { args = {}, longIndicator, shortIndicator, ts } = state
  const { symbol, long, short } = args
  const { debug, updateState, emitSelf, emit } = h
  const { chanFilter } = meta
  const { key } = chanFilter
  const { symbol: chanSymbol, tf: chanTF } = parseChannelKey(key)

  if (symbol !== chanSymbol) {
    return
  }

  let updateLastCandleLong = true
  let updateLastCandleShort = true
  let [lastCandle] = candles

  if (chanTF === long.candleTimeFrame) {
    if (longIndicator.l() === 0) {
      debug('seeding long indicator with %d candle prices', candles.length)

      candles.forEach((candle) => {
        longIndicator.add(candle[long.candlePrice])
      })
      lastCandle = _last(candles)
    } else {
      const price = lastCandle[long.candlePrice]
      debug('updating long indicator with candle price %f [%j]', price, lastCandle)

      if (!state.lastCandleLong) {
        longIndicator.add(price)
      } else if (state.lastCandleLong.mts === lastCandle.mts) {
        longIndicator.update(price)
      } else if (state.lastCandleLong.mts > lastCandle.mts) {
        updateLastCandleLong = false // do nothing
      } else {
        longIndicator.add(price)
      }
    }

    if (updateLastCandleLong) {
      await updateState(instance, { lastCandleLong: lastCandle })
    }
  }

  if (chanTF === short.candleTimeFrame) {
    if (shortIndicator.l() === 0) {
      debug('seeding short indicator with %d candle prices', candles.length)

      candles.forEach((candle) => {
        shortIndicator.add(candle[short.candlePrice])
      })
      lastCandle = _last(candles)
    } else {
      const price = lastCandle[short.candlePrice]
      debug('updating short indicator with candle price %f [%j]', price, lastCandle)

      if (!state.lastCandleShort) {
        shortIndicator.add(price)
      } else if (state.lastCandleShort.mts === lastCandle.mts) {
        shortIndicator.update(price)
      } else if (state.lastCandleShort.mts > lastCandle.mts) {
        updateLastCandleShort = false // do nothing
      } else {
        shortIndicator.add(price)
      }
    }

    if (updateLastCandleShort) {
      await updateState(instance, { lastCandleShort: lastCandle })
    }
  }

  const outdated = ts > lastCandle.mts
  if (outdated) {
    debug('outdated value, skipping execution', ts, '>', lastCandle.mts)
    return
  }

  const indicatorsUpdated = updateLastCandleShort || updateLastCandleLong
  if (indicatorsUpdated) {
    const longV = longIndicator.v()
    const shortV = shortIndicator.v()

    debug('long indicator value', longV)
    debug('short indicator value', shortV)

    if (_isFinite(shortV) && _isFinite(longV) && (
      shortIndicator.crossed(longV)
    )) {
      await emitSelf('submit_order')
      await emit('exec:stop', null, { keepOrdersOpen: true })
    }
  }
}

module.exports = onDataManagedCandles
