'use strict'

const hasOBRequirement = require('../util/has_ob_requirement')

module.exports = async (instance = {}, book, meta) => {
  const { state = {}, h = {} } = instance
  const { args = {} } = state
  const { symbol } = args
  const { debug, updateState } = h
  const { chanFilter } = meta
  const chanSymbol = chanFilter.symbol

  if (!hasOBRequirement(args) || symbol !== chanSymbol) {
    return
  }

  debug('recv updated order book for %s', symbol)

  await updateState(instance, {
    lastBook: book
  })
}
