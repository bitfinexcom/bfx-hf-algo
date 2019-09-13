'use strict'

const _isFinite = require('lodash/isFinite')
const _reverse = require('lodash/reverse')

module.exports = async (instance = {}, candles, meta) => {
  const { state = {}, h = {} } = instance
  const { args = {}, longIndicator, shortIndicator } = state
  const { symbol, long, short } = args
  const { debug, updateState, emitSelf, emit } = h
  const { chanFilter } = meta
  const { key } = chanFilter
  const chanDetails = key.split(':')
  const chanTF = chanDetails[1]
  const chanSymbol = chanDetails[2]

  if (symbol !== chanSymbol) {
    return
  }

  let indicatorsUpdated = false
  const [lastCandle] = candles

  if (chanTF === long.candleTimeFrame) {
    indicatorsUpdated = true

    if (longIndicator.l() === 0) {
      debug('seeding long indicator with %d candle prices', candles.length)
      const orderedCandles = _reverse(candles)

      orderedCandles.forEach((candle) => {
        longIndicator.add(candle[long.candlePrice])
      })
    } else {
      const price = lastCandle[long.candlePrice]
      debug('updating long indicator with candle price %f [%j]', price, lastCandle)

      if (!state.lastCandleLong) {
        longIndicator.add(price)
      } else if (state.lastCandleLong.mts === lastCandle.mts) {
        longIndicator.update(price)
      } else {
        longIndicator.add(price)
      }
    }

    await updateState(instance, { lastCandleLong: lastCandle })
  }

  if (chanTF === short.candleTimeFrame) {
    indicatorsUpdated = true

    if (shortIndicator.l() === 0) {
      debug('seeding short indicator with %d candle prices', candles.length)
      const orderedCandles = _reverse(candles)

      orderedCandles.forEach((candle) => {
        shortIndicator.add(candle[short.candlePrice])
      })
    } else {
      const price = lastCandle[short.candlePrice]
      debug('updating short indicator with candle price %f [%j]', price, lastCandle)

      if (!state.lastCandleShort) {
        shortIndicator.add(price)
      } else if (state.lastCandleShort.mts === lastCandle.mts) {
        shortIndicator.update(price)
      } else {
        shortIndicator.add(price)
      }
    }

    await updateState(instance, { lastCandleShort: lastCandle })
  }

  if (indicatorsUpdated) {
    const longV = longIndicator.v()
    const shortV = shortIndicator.v()

    if (_isFinite(shortV) && _isFinite(longV) && (
      shortIndicator.crossed(longV)
    )) {
      await emitSelf('submit_order')
      await emit('exec:stop')
    }
  }
}
