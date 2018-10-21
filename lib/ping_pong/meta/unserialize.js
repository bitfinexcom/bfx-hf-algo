'use strict'

const { BollingerBands }  = require('bfx-hf-indicators')

module.exports = (loadedState = {}) => {
  const {
    active, bbands, follow, pingPongTable, activePongs, args = {}
  } = loadedState

  return {
    active,
    // bbands: BollingerBands.unserialize(bbands),
    pingPongTable,
    activePongs,
    follow,
    args,
  }
}
