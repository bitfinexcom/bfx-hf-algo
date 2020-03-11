'use strict'

const hasOBTarget = require('../util/has_ob_target')

/**
 * Saves the book on the instance state if it is needed for price target
 * matching, and it is for the configured symbol.
 *
 * Mapped to the `data:managedBook` event.
 *
 * @memberOf module:TWAP
 * @param {object} instance - AO instance state
 * @param {object} book - order book model
 * @param {object} meta - source channel information
 * @param {object} meta.chanFilter - source channel filter
 * @param {string} meta.chanFilter.symbol - source channel symbol
 * @see module:TWAP~hasOBTarget
 */
const onDataManagedBook = async (instance = {}, book, meta) => {
  const { state = {}, h = {} } = instance
  const { args = {} } = state
  const { symbol } = args
  const { debug, updateState } = h
  const { chanFilter } = meta
  const chanSymbol = chanFilter.symbol

  if (!hasOBTarget(args) || symbol !== chanSymbol) {
    return
  }

  debug('recv updated order book for %s', symbol)

  await updateState(instance, {
    lastBook: book
  })
}

module.exports = onDataManagedBook
