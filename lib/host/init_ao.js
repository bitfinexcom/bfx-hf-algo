'use strict'

const initAOState = require('./init_ao_state')
const genHelpers = require('./gen_helpers')

/**
 * Creates a new algo order instance from the provided definition object &
 * arguments.
 *
 * @memberof AOHost
 * @private
 *
 * @param {object} adapter - exchange connection adapter
 * @param {object} aoDef - algo order definition
 * @param {object} args - instance arguments
 * @returns {AOInstance} instance
 */
const initAO = (adapter, aoDef = {}, args = {}) => {
  const state = initAOState(aoDef, args)
  const h = genHelpers(state, adapter)

  return { state, h }
}

module.exports = initAO
