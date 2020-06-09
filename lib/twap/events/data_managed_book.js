'use strict'

const hasOBTarget = require('../util/has_ob_target')

/**
 * Saves the book on the instance state if it is needed for price target
 * matching, and it is for the configured symbol.
 *
 * Mapped to the `data:managedBook` event.
 *
 * @memberof module:bfx-hf-algo/TWAP
 * @listens AOHost~dataManagedBook
 * @see module:bfx-hf-algo/TWAP.hasOBTarget
 *
 * @param {AOInstance} instance - AO instance state
 * @param {bfx-api-node-models.OrderBook} book - order book model
 * @param {AOHost~EventMetaInformation} meta - source channel information
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
