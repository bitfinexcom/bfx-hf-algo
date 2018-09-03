'use strict'

const hasTradeOffset = require('../util/has_trade_offset')

module.exports = async (instance = {}, trades, meta) => {
  const { state = {}, h = {} } = instance
  const { args = {} } = state
  const { symbol } = args
  const { debug, updateState } = h
  const { chanFilter } = meta
  const chanSymbol = chanFilter.symbol

  if (!hasTradeOffset(args) || symbol !== chanSymbol) {
    return
  }

  const [ lastTrade ] = trades
  const { price } = lastTrade

  debug('recv last price: %f [%j]', price, lastTrade)

  await updateState(instance, { lastTrade })
}
