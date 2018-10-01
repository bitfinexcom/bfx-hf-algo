'use strict'

const initAOState = require('./init_ao_state')
const genHelpers = require('./gen_helpers')

module.exports = (aoDef = {}, args = {}) => {
  const state = initAOState(aoDef, args)
  const h = genHelpers(state)

  return { state, h }
}
