'use strict'

/**
 * Converts a loaded POJO into a state object ready for live execution.
 *
 * Part of the `meta` handler section.
 *
 * @memberof module:bfx-hf-algo/TWAP
 * @param {object} loadedState - data from a DB
 * @returns {object} instanceState - ready for execution
 */
const unserialize = (loadedState = {}) => {
  const { remainingAmount, args = {}, label, name } = loadedState

  return {
    remainingAmount,
    label,
    name,
    args
  }
}

module.exports = unserialize
