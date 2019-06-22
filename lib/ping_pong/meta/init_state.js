'use strict'

const genPingPongTable = require('../util/gen_ping_pong_table')
const { BollingerBands } = require('bfx-hf-indicators')

module.exports = (args = {}) => {
  const { followBBands, bbandsPeriod, bbandsMul } = args
  const pingPongTable = followBBands
    ? {}
    : genPingPongTable(args)

  const bbandsIndicator = followBBands
    ? new BollingerBands([bbandsPeriod, bbandsMul])
    : null

  return {
    bbandsIndicator,
    activePongs: {}, // reverse mapping of pingPongTable
    pingPongTable,
    args
  }
}
