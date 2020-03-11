'use strict'

const hasOBRequirement = require('../util/has_ob_requirement')

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

module.exports = onDataManagedBook
