'use strict'

module.exports = (state = {}) => {
  const {
    bbands, follow, pingPongTable, activePongs, args = {}
  } = state

  return {
    // bbands: bbands.serialize(),
    pingPongTable,
    activePongs,
    follow,
    args,
  }
}
