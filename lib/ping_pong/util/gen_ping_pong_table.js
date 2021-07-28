'use strict'

const { append } = require('./ping_pong_table')

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

  let pingPongTable = []

  if (orderCount === 1) {
    pingPongTable = append(pingPongTable, pingPrice, pongPrice)
  } else {
    const step = (pingMaxPrice - pingMinPrice) / (orderCount - 1)

    for (let i = 0; i < orderCount; i += 1) {
      const price = pingMinPrice + (i * step)
      pingPongTable = append(pingPongTable, price, pongAmount > 0
        ? price + pongDistance
        : price - pongDistance)
    }
  }

  return pingPongTable
}

module.exports = genPingPongTable
