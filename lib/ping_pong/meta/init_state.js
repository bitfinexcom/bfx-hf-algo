'use strict'

const genPingPongTable = require('../util/gen_ping_pong_table')
const { BollingerBands } = require('bfx-hf-indicators')

/**
 * Creates an initial state object for PingPong instance to begin executing
 * with. Generates the ping-pong table price mapping.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:PingPong
 * @param {object} args - instance execution parameters
 * @returns {object} initialState
 * @see module:PingPong~genPingPongTable
 */
const initState = (args = {}) => {
  const { bbandsPeriod, bbandsMul } = args
  const pingPongTable = genPingPongTable(args)
  const bbands = new BollingerBands([bbandsPeriod, bbandsMul])

  return {
    bbands,
    activePongs: [], // reverse mapping of pingPongTable
    pingPongTable,
    args
  }
}

module.exports = initState
