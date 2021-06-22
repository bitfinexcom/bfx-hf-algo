'use strict'

const hasTradeTarget = require('../util/has_trade_target')
const hasOBTarget = require('../util/has_ob_target')

/**
 * Declares necessary data channels for price matching. The instance may
 * require a `book` or `trades` channel depending on the execution parameters.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:TWAP
 * @param {object} instance - AO instance state
 */
const declareChannels = async (instance = {}) => {
  const { h = {}, state = {} } = instance
  const { args = {} } = state
  const { symbol, priceTarget } = args
  const { declareChannel } = h

  if (hasTradeTarget(args)) {
    await declareChannel(instance, 'trades', { symbol })
  } else if (hasOBTarget(args)) {
    await declareChannel(instance, 'book', {
      symbol,
      prec: 'R0',
      len: '25'
    })
  } else {
    throw new Error(`invalid price target ${priceTarget}`)
  }
}

module.exports = declareChannels
