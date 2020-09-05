'use strict'

/**
 *
 * @memberOf module:OOCC
 * @listens AOHost~dataManagedCandles
 * @param {AOInstance} instance - AO instance
 * @param {object[]} candles - incoming candles
 * @param {EventMetaInformation} meta - source channel information
 * @returns {Promise} p - resolves on completion
 */
const onDataManagedCandles = async (instance = {}, candles, meta) => {
  const { state = {}, h = {} } = instance
  const { args = {}, lastCandle } = state
  const { symbol, candleTF } = args
  const { debug, updateState, emitSelf } = h
  const { chanFilter } = meta
  const { key } = chanFilter
  const chanDetails = key.split(':')
  const chanTF = chanDetails[1]
  const chanSymbol = chanDetails[2]

  if (symbol !== chanSymbol || chanTF !== candleTF) {
    return
  }

  if (!lastCandle) {
    debug('seeded last candle')
    return updateState(instance, { lastCandle: candles[0] })
  }

  if (lastCandle.mts === candles[0].mts) { // same candle
    debug('received candle update, awaiting timestamp change...')
    return
  }

  return emitSelf('submit_order')
}

module.exports = onDataManagedCandles
