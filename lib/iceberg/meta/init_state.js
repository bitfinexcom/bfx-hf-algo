'use strict'

/**
 * Creates an initial state object for an Iceberg instance to begin executing
 * with.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:Iceberg
 * @param {object} args - instance execution parameters
 * @returns {object} initialState
 */
const initState = (args = {}) => {
  const { amount } = args

  return {
    remainingAmount: amount,
    args
  }
}

module.exports = initState
