'use strict'

const _isEmpty = require('lodash/isEmpty')
const hasTradeRequirement = require('../util/has_trade_requirement')

const getTradeData = (trade) => {
  const { id, mts, amount, price } = trade

  return [
    [id, new Date(mts), amount, price]
  ]
}
/**
 * Saves the received trade on the instance state if it is needed for order
 * generation.
 *
 * @memberOf module:AccumulateDistribute
 * @listens AOHost~event:dataTrades
 * @see module:AccumulateDistribute.hasTradeRequirement
 *
 * @param {AOInstance} instance - AO instance state
 * @param {object[]} trades - array of incoming trades, only the most recent
 *   is used.
 * @param {EventMetaInformation} meta - source channel information
 * @returns {Promise} p
 */
const onDataTrades = async (instance = {}, trades = {}, meta) => {
  const { state = {}, h = {} } = instance
  const { args = {}, gid, lastTrade: lastTradeInState = {} } = state
  const { symbol } = args
  const { debug, updateState, emit } = h
  const { chanFilter } = meta
  const chanSymbol = chanFilter.symbol

  const lastTrade = trades.length ? trades[0] : trades

  if (
    !hasTradeRequirement(args) || symbol !== chanSymbol ||
    _isEmpty(lastTrade) || lastTrade.id === lastTradeInState.id
  ) {
    return
  }

  const { price } = lastTrade

  debug('recv last price: %f [%j]', price, lastTrade)

  await updateState(instance, { lastTrade })

  await emit('exec:log_algo_data', gid, getTradeData(lastTrade), 'trades', 'DATA_TRADES')
}

module.exports = onDataTrades
