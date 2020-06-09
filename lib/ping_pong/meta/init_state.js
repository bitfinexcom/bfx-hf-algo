'use strict'

const genPingPongTable = require('../util/gen_ping_pong_table')
const { BollingerBands } = require('bfx-hf-indicators')

/**
 * Creates an initial state object for PingPong instance to begin executing
 * with. Generates the ping-pong table price mapping.
 *
 * Part of the `meta` handler section.
 *
 * @memberof module:bfx-hf-algo/PingPong
 * @see module:bfx-hf-algo/PingPong~genPingPongTable
 *
 * @param {object} args - instance execution parameters
 * @returns {object} initialState
 */
const initState = (args = {}) => {
  const { bbandsPeriod, bbandsMul } = args
  const pingPongTable = genPingPongTable(args)
  const bbands = new BollingerBands([bbandsPeriod, bbandsMul])

  return {
    bbands,
    activePongs: {}, // reverse mapping of pingPongTable
    pingPongTable,
    args
  }
}

module.exports = initState
