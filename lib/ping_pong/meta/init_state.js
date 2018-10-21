'use strict'

const genPingPongTable = require('../util/gen_ping_pong_table')
const { BollingerBands }  = require('bfx-hf-indicators')

module.exports = (args = {}) => {
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
