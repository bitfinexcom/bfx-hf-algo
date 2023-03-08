'use strict'

/**
 * Converts a loaded POJO into a state object ready for live execution.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:PingPong
 * @param {object} loadedState - data from a DB
 * @returns {object} instanceState - ready for execution
 * @see module:PingPong.serialize
 */
const unserialize = (loadedState = {}) => {
  const {
    follow,
    pingPongTable,
    activePongs,
    args = {},
    name,
    label,
    alias
  } = loadedState
  const { action, pingAmount } = args
  if (!action) {
    args.action = pingAmount > 0 ? 'buy' : 'sell'
  }

  return {
    pingPongTable,
    activePongs,
    follow,
    alias,
    label,
    name,
    args
  }
}

module.exports = unserialize
