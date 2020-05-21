'use strict'

/**
 * Creates an initial state object for an OCOCO instance to begin executing with.
 *
 * Part of the `meta` handler section.
 *
 * @memberof module:bfx-hf-algo/OCOCO
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
