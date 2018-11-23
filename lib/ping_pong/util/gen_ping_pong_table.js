'use strict'

const { preparePrice } = require('bfx-api-node-util')

module.exports = (args = {}) => {
  const {
    pongAmount, pingPrice, pongPrice, pingMinPrice, pingMaxPrice, orderCount,
    pongDistance,
  } = args

  const pingPongTable = {}

  if (orderCount === 1) {
    pingPongTable[preparePrice(pingPrice)] = preparePrice(pongPrice)
  } else {
    const step = (pingMaxPrice - pingMinPrice) / (orderCount - 1)

    for (let i = 0; i < orderCount; i += 1) {
      const price = pingMinPrice + (i * step)
      pingPongTable[preparePrice(price)] = preparePrice(pongAmount > 0
        ? price + pongDistance
        : price - pongDistance)
    }
  }

  return pingPongTable
}
