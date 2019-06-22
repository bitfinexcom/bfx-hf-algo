'use strict'

module.exports = async (instance = {}, host) => {
  const { h = {}, state = {} } = instance
  const { args = {} } = state
  const { followBBands, bbandsTF, symbol } = args
  const { declareChannel } = h

  if (followBBands) {
    await declareChannel(instance, host, 'candles', {
      key: `trade:${bbandsTF}:${symbol}`
    })
  }
}
