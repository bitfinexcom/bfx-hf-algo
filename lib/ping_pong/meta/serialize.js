'use strict'

/**
 * Creates a POJO from an instance's state which can be stored as JSON in a
 * database, and later loaded with the corresponding
 * {@link module:bfx-hf-algo/PingPong~unserialize} method.
 *
 * Part of the `meta` handler section.
 *
 * @memberof module:bfx-hf-algo/PingPong
 * @param {object} state - instance state to be serialized
 * @returns {object} pojo - DB-ready plain JS object
 * @see module:bfx-hf-algo/PingPong.unserialize
 */
const serialize = (state = {}) => {
  const {
    follow, pingPongTable, activePongs, args = {}, label, name
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

module.exports = serialize
