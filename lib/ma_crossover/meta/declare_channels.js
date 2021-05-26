'use strict'

const _uniq = require('lodash/uniq')

/**
 * Declares necessary candle data channels for updating indicators and
 * eventually triggering atomic order execution.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:MACrossover
 * @param {AOInstance} instance - AO instance state
 */
const declareChannels = async (instance = {}) => {
  const { h = {}, state = {} } = instance
  const { args = {} } = state
  const { symbol, long, short } = args
  const { declareChannel } = h

  const candleTimeFrames = _uniq([
    long.candleTimeFrame,
    short.candleTimeFrame
  ])

  for (let i = 0; i < candleTimeFrames.length; i += 1) {
    await declareChannel(instance, 'candles', {
      key: `trade:${candleTimeFrames[i]}:${symbol}`
    })
  }
}

module.exports = declareChannels
