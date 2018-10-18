'use strict'

module.exports = (loadedState = {}) => {
  const { pingPongTable, activePongs, args = {} } = loadedState

  return {
    pingPongTable,
    activePongs,
    args
  }
}
