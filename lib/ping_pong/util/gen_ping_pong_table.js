'use strict'

const { preparePrice } = require('bfx-api-node-util')
const { nBN } = require('@bitfinex/lib-js-util-math')

/**
 * Generates a mapping between `ping` and `pong` prices as configured in the
 * execution parameters.
 *
 * @memberOf module:PingPong
 * @name module:PingPong.genPingPongTable
 *
 * @param {object} args - execution parameters
 * @returns {object} table
 */
const genPingPongTable = (args = {}) => {
  const {
    pongAmount, pingPrice, pongPrice, pingMinPrice, pingMaxPrice, orderCount,
    pongDistance
  } = args

  const pingPongTable = {}

  if (orderCount === 1) {
    pingPongTable[preparePrice(pingPrice)] = preparePrice(pongPrice)
  } else {
    const step = nBN((nBN(pingMaxPrice).minus(pingMinPrice).toNumber())).dividedBy(orderCount - 1).toNumber()

    for (let i = 0; i < orderCount; i += 1) {
      const price = pingMinPrice + (i * step)
      pingPongTable[preparePrice(price)] = preparePrice(pongAmount > 0
        ? price + pongDistance
        : price - pongDistance)
    }
  }

  return pingPongTable
}

module.exports = genPingPongTable
