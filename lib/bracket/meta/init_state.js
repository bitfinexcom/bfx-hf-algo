'use strict'

/**
 * Creates an initial state object for an Bracket instance to begin executing with.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:Bracket
 * @param {object} args - instance execution parameters
 * @returns {object} initialState
 */
const initState = (args = {}) => {
  return {
    args,
    initialOrderFilled: false
  }
}

module.exports = initState
