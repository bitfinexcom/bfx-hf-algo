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
 * @memberOf module:AccumulateDistribute
 * @see module:AccumulateDistribute.hasOBRequirement
 * @see module:AccumulateDistribute.hasTradeRequirement
 * @see module:AccumulateDistribute.hasIndicatorCap
 * @see module:AccumulateDistribute.hasIndicatorOffset
 *
 * @param {AOInstance} instance - AO instance state
 * @returns {Promise} p
 */
const declareChannels = async (instance = {}) => {
  const { h = {}, state = {} } = instance
  const { args = {} } = state
  const { symbol } = args
  const { declareChannel } = h

  if (hasTradeRequirement(args)) {
    await declareChannel(instance, 'trades', { symbol })
  }

  if (hasOBRequirement(args)) {
    await declareChannel(instance, 'book', {
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
    await declareChannel(instance, 'candles', {
      key: `trade:${candleChannels[i]}:${symbol}`
    })
  }
}

module.exports = declareChannels
