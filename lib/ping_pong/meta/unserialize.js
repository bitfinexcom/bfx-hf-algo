'use strict'

module.exports = (loadedState = {}) => {
  const {
    follow, pingPongTable, activePongs, args = {}
  } = loadedState

  return {
    pingPongTable,
    activePongs,
    follow,
    args
  }
}
