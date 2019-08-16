'use strict'

const _uniq = require('lodash/uniq')

module.exports = async (instance = {}, host) => {
  const { h = {}, state = {} } = instance
  const { args = {} } = state
  const { symbol, long, short } = args
  const { declareChannel } = h

  const candleTimeFrames = _uniq([
    long.candleTimeFrame,
    short.candleTimeFrame,
  ])

  for (let i = 0; i < candleTimeFrames.length; i += 1) {
    await declareChannel(instance, host, 'candles', {
      key: `trade:${candleTimeFrames[i]}:${symbol}`
    })
  }
}
