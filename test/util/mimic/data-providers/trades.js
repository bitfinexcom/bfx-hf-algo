'use strict'

// const timeFrames = require('bfx-hf-util/lib/candles/time_frames')
// const parseChannelKey = require('../../../../lib/util/parse_channel_key')

/**
 * @param {Randomizer} randomizer
 * @param baseCandle
 * @returns {DataProvider}
 */
module.exports = (randomizer, baseTrade) => {
  return (fields, prevTrade) => {
    const [id, mts, amount, price] = baseTrade
    const nextPrice = price + randomizer.range(-100, 100)

    return [id, mts, amount, nextPrice]
  }
}
