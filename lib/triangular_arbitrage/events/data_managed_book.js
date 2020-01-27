'use strict'

const hasOBTarget = require('../util/has_ob_target')
const trySubmitOrder = require('../util/try_submit_order')

module.exports = async (instance = {}, book, meta) => {
  const { state = {}, h = {} } = instance
  const { args = {}, lastBook = {} } = state
  const { symbol1, symbol2, symbol3 } = args
  const { debug, updateState } = h
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

  trySubmitOrder(instance)
}
