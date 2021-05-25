'use strict'

const timeFrames = require('../../../../lib/constants/time_frames')
const parseChannelKey = require('../../../../lib/util/parse_channel_key')

/**
 * @param {Randomizer} randomizer
 * @param baseCandle
 * @returns {DataProvider}
 */
module.exports = (randomizer, baseCandle) => {
  return ({ key }, prevCandle) => {
    let [mts, open, close, high, low, volume] = prevCandle || baseCandle
    const { tf } = parseChannelKey(key)

    const lowVariation = randomizer.range(-100, 100)
    low += lowVariation

    const highVariation = randomizer.range(lowVariation + 1, lowVariation + 100)
    high += highVariation

    close = randomizer.range(low, high)
    open = randomizer.range(low, high)
    volume = Math.abs(volume + randomizer.range(-3, 1.5))
    mts += timeFrames[tf]

    return [mts, open, close, high, low, volume]
  }
}
