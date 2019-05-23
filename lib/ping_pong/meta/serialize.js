'use strict'

module.exports = (state = {}) => {
  const {
    follow, pingPongTable, activePongs, args = {}
  } = state

  return {
    pingPongTable,
    activePongs,
    follow,
    args
  }
}
