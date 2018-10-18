'use strict'

const genPingPongTable = require('../util/gen_ping_pong_table')

module.exports = (args = {}) => {
  const pingPongTable = genPingPongTable(args)

  return {
    activePongs: [],
    pingPongTable,
    args
  }
}
