'use strict'

require('../../ao_host')
const hasTradeRequirement = require('../util/has_trade_requirement')

/**
 * Saves the received trade on the instance state if it is needed for order
 * generation.
 *
 * @memberof module:bfx-hf-algo/AccumulateDistribute
 * @listens AOHost~event:dataTrades
 * @see module:bfx-hf-algo/AccumulateDistribute.hasTradeRequirement
 *
 * @param {AOInstance} instance - AO instance state
 * @param {object[]} trades - array of incoming trades, only the most recent
 *   is used.
 * @param {AOHost~EventMetaInformation} meta - source channel information
 * @returns {Promise} p
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
