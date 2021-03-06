'use strict'

/**
 * Creates an initial state object for an MACrossover instance to begin
 * executing with.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:MACrossover
 * @param {object} args - instance execution parameters
 * @returns {object} initialState
 */
const initState = (args = {}) => {
  return { args, ts: null }
}

module.exports = initState
