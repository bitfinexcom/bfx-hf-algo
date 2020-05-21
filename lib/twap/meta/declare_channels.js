'use strict'

const hasTradeTarget = require('../util/has_trade_target')
const hasOBTarget = require('../util/has_ob_target')

/**
 * Declares necessary data channels for price matching. The instance may
 * require a `book` or `trades` channel depending on the execution parameters.
 *
 * Part of the `meta` handler section.
 *
 * @memberof module:bfx-hf-algo/TWAP
 * @param {object} instance - AO instance state
 * @param {object} host - algo host instance for declaring channel requirements
 */
const declareChannels = async (instance = {}, host) => {
  const { h = {}, state = {} } = instance
  const { args = {} } = state
  const { symbol, priceTarget } = args
  const { declareChannel } = h

  if (hasTradeTarget(args)) {
    await declareChannel(instance, host, 'trades', { symbol })
  } else if (hasOBTarget(args)) {
    await declareChannel(instance, host, 'book', {
      symbol,
      prec: 'R0',
      len: '25'
    })
  } else {
    throw new Error(`invalid price target ${priceTarget}`)
  }
}

module.exports = declareChannels
