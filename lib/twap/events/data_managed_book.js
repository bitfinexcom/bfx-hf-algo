'use strict'

const hasOBTarget = require('../util/has_ob_target')

/**
 * Saves the book on the instance state if it is needed for price target
 * matching, and it is for the configured symbol.
 *
 * Mapped to the `data:managedBook` event.
 *
 * @memberOf module:TWAP
 * @listens module:bfx-hf-algo.AOHost~dataManagedBook
 * @see module:TWAP.hasOBTarget
 *
 * @param {module:bfx-hf-algo.AOInstance} instance - AO instance state
 * @param {module:bfx-api-node-models.OrderBook} book - order book model
 * @param {module:bfx-hf-algo.AOHost~EventMetaInformation} meta - source
 *   channel information
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
