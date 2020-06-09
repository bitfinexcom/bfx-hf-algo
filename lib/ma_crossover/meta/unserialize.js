'use strict'

/**
 * Converts a loaded POJO into a state object ready for live execution.
 *
 * Part of the `meta` handler section.
 *
 * @memberof module:bfx-hf-algo/MACrossover
 * @param {object} loadedState - data from a DB
 * @returns {object} instanceState - ready for execution
 */
const unserialize = (loadedState = {}) => {
  const { args = {}, name, label } = loadedState

  return {
    label,
    name,
    args
  }
}

module.exports = unserialize
