'use strict'

const genHelpers = require('./gen_helpers')

/**
 * @typedef {Object} AoInstance
 * @property {AoHelpers} h
 * @property {InitialAoState|Object} state
 */

/**
 * Creates a new algo order instance from the provided definition object &
 * arguments.
 *
 * @param {object} adapter - exchange connection adapter
 * @param {object} state
 * @param {object} config
 * @returns {AoInstance} instance
 */
module.exports = (adapter, state, config) => {
  const h = genHelpers(state, adapter, config)
  return { state, h }
}
