'use strict'

const _reverse = require('lodash/reverse')

module.exports = async (instance = {}, candles, meta) => {
  const { state = {}, h = {} } = instance
  const { args = {}, bbandsIndicator } = state
  const { symbol, followBBands, bbandsCandlePrice } = args
  const { debug, emitSelf } = h
  const { chanFilter } = meta
  const { key } = chanFilter
  const chanSymbol = key.split(':')[2]

  if (!followBBands || symbol !== chanSymbol) {
    return
  }

  const [ lastCandle ] = candles

  if (bbandsIndicator.l() === 0) {
    debug('seeding bbands with %d candle prices', candles.length)

    const orderedCandles = _reverse(candles)
    orderedCandles.forEach((candle) => {
      bbandsIndicator.add(candle[bbandsCandlePrice])
    })

    await emitSelf('bband_seed_complete') // submit initial orders
  } else {
    debug('updating bbands indicator with candle [%j]', lastCandle)
    bbandsIndicator.add(lastCandle[bbandsCandlePrice])
  }
}
