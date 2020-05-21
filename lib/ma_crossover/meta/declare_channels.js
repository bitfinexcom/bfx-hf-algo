'use strict'

const _uniq = require('lodash/uniq')

/**
 * Declares necessary candle data channels for updating indicators and
 * eventually triggering atomic order execution.
 *
 * Part of the `meta` handler section.
 *
 * @memberof module:bfx-hf-algo/MACrossover
 * @param {module:bfx-hf-algo.AOInstance} instance - AO instance state
 * @param {module:bfx-hf-algo.AOHost} host - algo host instance for declaring
 *   channel requirements
 */
const declareChannels = async (instance = {}, host) => {
  const { h = {}, state = {} } = instance
  const { args = {} } = state
  const { symbol, long, short } = args
  const { declareChannel } = h

  const candleTimeFrames = _uniq([
    long.candleTimeFrame,
    short.candleTimeFrame
  ])

  for (let i = 0; i < candleTimeFrames.length; i += 1) {
    await declareChannel(instance, host, 'candles', {
      key: `trade:${candleTimeFrames[i]}:${symbol}`
    })
  }
}

module.exports = declareChannels
