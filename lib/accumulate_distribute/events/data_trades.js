'use strict'

const hasTradeRequirement = require('../util/has_trade_requirement')

/**
 * Saves the received trade on the instance state if it is needed for order
 * generation.
 *
 * Mapped to the `data:trades` event.
 *
 * @memberOf module:AccumulateDistribute
 * @param {object} instance - AO instance state
 * @param {object[]} trades - array of incoming trades, only the most recent
 *   is used.
 * @param {object} meta - source channel information
 * @param {object} meta.chanFilter - source channel filter
 * @param {string} meta.chanFilter.symbol - source channel symbol
 */
const onDataTrades = async (instance = {}, trades, meta) => {
  const { state = {}, h = {} } = instance
  const { args = {} } = state
  const { symbol } = args
  const { debug, updateState } = h
  const { chanFilter } = meta
  const chanSymbol = chanFilter.symbol

  if (!hasTradeRequirement(args) || symbol !== chanSymbol) {
    return
  }

  const [lastTrade] = trades
  const { price } = lastTrade

  debug('recv last price: %f [%j]', price, lastTrade)

  await updateState(instance, { lastTrade })
}

module.exports = onDataTrades
