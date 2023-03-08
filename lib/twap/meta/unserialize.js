'use strict'

/**
 * Converts a loaded POJO into a state object ready for live execution.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:TWAP
 * @param {object} loadedState - data from a DB
 * @returns {object} instanceState - ready for execution
 */
const unserialize = (loadedState = {}) => {
  const { remainingAmount, args = {}, label, name, alias } = loadedState
  const { amount, action } = args
  if (!action) {
    args.action = amount > 0 ? 'buy' : 'sell'
  }

  return {
    remainingAmount,
    alias,
    label,
    name,
    args
  }
}

module.exports = unserialize
