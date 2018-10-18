'use strict'

module.exports = (state = {}) => {
  const { pingPongTable, activePongs, args = {} } = state

  return {
    pingPongTable,
    activePongs,
    args
  }
}
