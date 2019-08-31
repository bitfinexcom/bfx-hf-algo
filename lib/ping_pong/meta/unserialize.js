'use strict'

module.exports = (loadedState = {}) => {
  const {
    follow, pingPongTable, activePongs, args = {}, name, label
  } = loadedState

  return {
    pingPongTable,
    activePongs,
    follow,
    label,
    name,
    args
  }
}
