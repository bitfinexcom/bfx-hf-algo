'use strict'

module.exports = (state = {}) => {
  const {
    active, bbands, follow, pingPongTable, activePongs, args = {}
  } = state

  return {
    active,
    // bbands: bbands.serialize(),
    pingPongTable,
    activePongs,
    follow,
    args,
  }
}
