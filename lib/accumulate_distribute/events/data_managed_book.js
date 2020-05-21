'use strict'

const hasOBRequirement = require('../util/has_ob_requirement')

/**
 * Saves the book on the instance state if it is needed for order generation,
 * and it is for the configured symbol.
 *
 * @memberof module:bfx-hf-algo/AccumulateDistribute
 * @listens module:bfx-hf-algo.AOHost~event:dataManagedBook
 * @see module:bfx-hf-algo/AccumulateDistribute.hasOBRequirement
 *
 * @param {module:bfx-hf-algo.AOInstance} instance - AO instance state
 * @param {object} book - order book model
 * @param {module:bfx-hf-algo.AOHost~EventMetaInformation} meta - source
 *   channel information
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
