'use strict'

/**
 * Creates an initial state object for a TWAP instance to begin executing with.
 *
 * Part of the `meta` handler section.
 *
 * @memberof module:bfx-hf-algo/TWAP
 * @param {object} args - instance execution parameters
 * @returns {object} initialState
 */
const initState = (args = {}) => {
  const { amount } = args

  return {
    interval: null,
    remainingAmount: amount,
    args
  }
}

module.exports = initState
