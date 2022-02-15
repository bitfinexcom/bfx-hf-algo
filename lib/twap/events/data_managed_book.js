'use strict'

const { OrderBook } = require('bfx-api-node-models')
const hasOBTarget = require('../util/has_ob_target')

/**
 * Saves the book on the instance state if it is needed for price target
 * matching, and it is for the configured symbol.
 *
 * Mapped to the `data:managedBook` event.
 *
 * @memberOf module:TWAP
 * @listens AOHost~dataManagedBook
 * @see module:TWAP.hasOBTarget
 *
 * @param {AOInstance} instance - AO instance state
 * @param {object} book - order book model
 * @param {EventMetaInformation} meta - source channel information
 */
const onDataManagedBook = async (instance = {}, book, meta) => {
  const { state = {}, h = {} } = instance
  const { args = {}, allOrders = {} } = state
  const { symbol } = args
  const { debug, updateState, tracer } = h
  const { chanFilter } = meta
  const chanSymbol = chanFilter.symbol

  if (!hasOBTarget(args) || symbol !== chanSymbol) {
    return
  }

  debug('recv updated order book for %s', symbol)

  const activeOrdersIds = new Set(Object.values(allOrders).map(order => order.id))
  const externalBook = book.serialize().filter(([orderId]) => !activeOrdersIds.has(orderId))

  tracer.createSignal('data_managed_book', null, { externalBook })

  await updateState(instance, {
    lastBook: new OrderBook(externalBook, book.raw)
  })
}

module.exports = onDataManagedBook
