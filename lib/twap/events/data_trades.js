'use strict'

const hasTradeTarget = require('../util/has_trade_target')

/**
 * Saves the last trade on the instance state to be used in price matching.
 *
 * Mapped to the `data:trades` event.
 *
 * @memberof module:bfx-hf-algo/TWAP
 * @listens AOHost~dataTrades
 *
 * @param {AOInstance} instance - AO instance
 * @param {object[]} trades - array of incoming trades
 * @param {AOHost~EventMetaInformation} meta - source channel information
 * @returns {Promise} p - resolves on completion
 */
const onDataTrades = async (instance = {}, trades, meta) => {
  const { state = {}, h = {} } = instance
  const { args = {} } = state
  const { symbol } = args
  const { debug, updateState } = h
  const { chanFilter } = meta
  const chanSymbol = chanFilter.symbol

  if (!hasTradeTarget(args) || symbol !== chanSymbol) {
    return
  }

  const [lastTrade] = trades
  const { price } = lastTrade

  debug('recv last price: %f [%j]', price, lastTrade)

  await updateState(instance, { lastTrade })
}

module.exports = onDataTrades
