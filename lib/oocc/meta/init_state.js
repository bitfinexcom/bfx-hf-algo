'use strict'

/**
 * Creates an initial state object for an OOCC instance to begin executing with.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:OCOCO
 * @param {object} args - instance execution parameters
 * @returns {object} initialState
 */
const initState = (args = {}) => {
  return { args } // no state required, stops execution after order submit
}

module.exports = initState
