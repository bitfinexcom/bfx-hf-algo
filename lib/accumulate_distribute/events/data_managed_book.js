'use strict'

const hasOBRequirement = require('../util/has_ob_requirement')

const getOrderBookData = (book) => {
  const [topAskId = null] = book.topAskLevel() || []
  const [topBidId = null] = book.topBidLevel() || []
  const topAskPrice = book.topAsk()
  const topBidPrice = book.topBid()
  const midPrice = book.midPrice()

  return [
    [new Date(), topAskId, topAskPrice, topBidId, topBidPrice, midPrice]
  ]
}
/**
 * Saves the book on the instance state if it is needed for order generation,
 * and it is for the configured symbol.
 *
 * @memberOf module:AccumulateDistribute
 * @listens AOHost~event:dataManagedBook
 * @see module:AccumulateDistribute.hasOBRequirement
 *
 * @param {AOInstance} instance - AO instance state
 * @param {object} book - order book model
 * @param {EventMetaInformation} meta - source channel information
 * @returns {Promise} p - resolves on completion
 */
const onDataManagedBook = async (instance = {}, book, meta) => {
  const { state = {}, h = {} } = instance
  const { args = {}, gid } = state
  const { symbol } = args
  const { debug, updateState, emit } = h
  const { chanFilter } = meta
  const chanSymbol = chanFilter.symbol

  if (!hasOBRequirement(args) || symbol !== chanSymbol) {
    return
  }

  debug('recv updated order book for %s', symbol)

  await updateState(instance, { lastBook: book })
  await emit('exec:log_algo_data', gid, getOrderBookData(book), 'ob_price', 'OB_PRICE')
}

module.exports = onDataManagedBook
