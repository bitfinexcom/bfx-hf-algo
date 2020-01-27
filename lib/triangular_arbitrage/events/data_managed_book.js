'use strict'

const hasOBTarget = require('../util/has_ob_target')
const generateOrder = require('../util/generate_order')

module.exports = async (instance = {}, book, meta) => {
  const { state = {}, h = {} } = instance
  const { args = {}, lastBook = {}, gid, orders = {} } = state
  const { symbol1, symbol2, symbol3, submitDelay } = args
  const { debug, updateState, emit } = h
  const { chanFilter } = meta
  const chanSymbol = chanFilter.symbol

  if (!hasOBTarget(args)) {
    return
  }

  if (![symbol1, symbol2, symbol3].includes(chanSymbol)) {
    return
  }

  debug('recv updated order book for %s', chanSymbol)

  lastBook[chanSymbol] = book
  await updateState(instance, {
    lastBook: lastBook
  })

  if (chanSymbol === symbol1 && Object.values(orders).length <= 0) {
    // haven't started arbitrage yet so open initial order
    const order = generateOrder(instance, symbol1)
    if (order) {
      await emit('exec:order:submit:all', gid, [order], submitDelay)
    }
  }
}
