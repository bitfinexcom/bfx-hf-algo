'use strict'

const hasTradeTarget = require('../util/has_trade_target')

/**
 * Saves the last trade on the instance state to be used in price matching.
 *
 * Mapped to the `data:trades` event.
 *
 * @memberOf module:TWAP
 * @listens AOHost~dataTrades
 *
 * @param {AOInstance} instance - AO instance
 * @param {object[]} trades - array of incoming trades
 * @param {EventMetaInformation} meta - source channel information
 * @returns {Promise} p - resolves on completion
 */
const onDataTrades = async (instance = {}, trades, meta) => {
  const { state = {}, h = {} } = instance
  const { args = {} } = state
  const { symbol } = args
  const { debug, updateState, tracer } = h
  const { chanFilter } = meta
  const chanSymbol = chanFilter.symbol

  if (!hasTradeTarget(args) || symbol !== chanSymbol) {
    return
  }

  // the 'trades' parameter may not always be an array
  // https://github.com/bitfinexcom/bfx-api-node-models/blob/master/lib/util/assign_from_collection_or_instance.js#L25
  const lastTrade = trades.length ? trades[0] : trades
  const { price } = lastTrade

  debug('recv last price: %f [%j]', price, lastTrade)

  tracer.createSignal('data_trades', null, {
    trades: Object.values(trades)
  })

  await updateState(instance, { lastTrade })
}

module.exports = onDataTrades
