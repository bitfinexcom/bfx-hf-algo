'use strict'

const { BollingerBands }  = require('bfx-hf-indicators')

module.exports = (loadedState = {}) => {
  const {
    bbands, follow, pingPongTable, activePongs, args = {}
  } = loadedState

  return {
    // bbands: BollingerBands.unserialize(bbands),
    pingPongTable,
    activePongs,
    follow,
    args,
  }
}
