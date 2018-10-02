'use strict'

const hasTradeRequirement = require('../util/has_trade_requirement')

module.exports = async (instance = {}, trades, meta) => {
  const { state = {}, h = {} } = instance
  const { args = {} } = state
  const { symbol } = args
  const { debug, updateState } = h
  const { chanFilter } = meta
  const chanSymbol = chanFilter.symbol

  if (!hasTradeRequirement(args) || symbol !== chanSymbol) {
    return
  }

  const [ lastTrade ] = trades
  const { price } = lastTrade

  debug('recv last price: %f [%j]', price, lastTrade)

  await updateState(instance, { lastTrade })
}
