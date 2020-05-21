'use strict'

/**
 * Converts a loaded POJO into a state object ready for live execution.
 *
 * Part of the `meta` handler section.
 *
 * @memberof module:bfx-hf-algo/PingPong
 * @param {object} loadedState - data from a DB
 * @returns {object} instanceState - ready for execution
 * @see module:bfx-hf-algo/PingPong.serialize
 */
const unserialize = (loadedState = {}) => {
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

module.exports = unserialize
