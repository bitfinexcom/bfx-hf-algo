'use strict'

/**
 * Creates an initial state object for a TWAP instance to begin executing with.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:TWAP
 * @param {object} args - instance execution parameters
 * @returns {object} initialState
 */
const initState = (args = {}) => {
  const { amount } = args

  return {
    timeout: null,
    remainingAmount: amount,
    args,
    shutdown: false
  }
}

module.exports = initState
