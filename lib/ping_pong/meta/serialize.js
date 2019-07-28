'use strict'

module.exports = (state = {}) => {
  const {
    follow, pingPongTable, activePongs, args = {}, label, name,
  } = state

  return {
    pingPongTable,
    activePongs,
    follow,
    label,
    name,
    args
  }
}
