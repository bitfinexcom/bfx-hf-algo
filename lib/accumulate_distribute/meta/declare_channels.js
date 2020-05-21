'use strict'

const hasOBRequirement = require('../util/has_ob_requirement')
const hasTradeRequirement = require('../util/has_trade_requirement')
const hasIndicatorCap = require('../util/has_indicator_cap')
const hasIndicatorOffset = require('../util/has_indicator_offset')

/**
 * Declares necessary data channels for price offset & cap calculations. The
 * instance may require a `trades` channel, `book` channel, or multiple `candle`
 * channels depending on the execution parameters.
 *
 * Part of the `meta` handler section.
 *
 * @memberof module:bfx-hf-algo/AccumulateDistribute
 * @see module:bfx-hf-algo/AccumulateDistribute.hasOBRequirement
 * @see module:bfx-hf-algo/AccumulateDistribute.hasTradeRequirement
 * @see module:bfx-hf-algo/AccumulateDistribute.hasIndicatorCap
 * @see module:bfx-hf-algo/AccumulateDistribute.hasIndicatorOffset
 *
 * @param {module:bfx-hf-algo.AOInstance} instance - AO instance state
 * @param {module:bfx-hf-algo.AOHost} host - algo host instance for declaring
 *   channel requirements
 * @returns {Promise} p
 */
const declareChannels = async (instance = {}, host) => {
  const { h = {}, state = {} } = instance
  const { args = {} } = state
  const { symbol } = args
  const { declareChannel } = h

  if (hasTradeRequirement(args)) {
    await declareChannel(instance, host, 'trades', { symbol })
  }

  if (hasOBRequirement(args)) {
    await declareChannel(instance, host, 'book', {
      symbol,
      prec: 'R0',
      len: '25'
    })
  }

  const candleChannels = []

  if (hasIndicatorCap(args)) {
    const { candleTimeFrame } = args.relativeCap
    candleChannels.push(candleTimeFrame)
  }

  if (hasIndicatorOffset(args)) {
    const { candleTimeFrame } = args.relativeOffset

    if (candleTimeFrame !== candleChannels[0]) { // different channel from cap
      candleChannels.push(candleTimeFrame)
    }
  }

  for (let i = 0; i < candleChannels.length; i += 1) { // cap/offset candles
    await declareChannel(instance, host, 'candles', {
      key: `trade:${candleChannels[i]}:${symbol}`
    })
  }
}

module.exports = declareChannels
