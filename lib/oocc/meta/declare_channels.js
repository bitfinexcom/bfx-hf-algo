'use strict'

/**
 * Declares necessary data channels for price matching. The instance may
 * require a `book` or `trades` channel depending on the execution parameters.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:TWAP
 * @param {object} instance - AO instance state
 * @param {object} host - algo host instance for declaring channel requirements
 */
const declareChannels = async (instance = {}, host) => {
  const { h = {}, state = {} } = instance
  const { args = {} } = state
  const { symbol, candleTF } = args
  const { declareChannel } = h

  return declareChannel(instance, host, 'candles', {
    key: `trade:${candleTF}:${symbol}`
  })
}

module.exports = declareChannels
