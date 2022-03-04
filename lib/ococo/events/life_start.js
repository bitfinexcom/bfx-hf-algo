'use strict'

const { StartSignal } = require('bfx-hf-signals/lib/types')

/**
 * Submits the initial order as configured within the execution parameters
 *
 * @memberOf module:OCOCO
 * @listens AOHost~lifeStart
 * @see module:OCOCO.onSelfSubmitInitialOrder
 *
 * @param {AOInstance} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onLifeStart = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { args = {}, initialOrderFilled } = state
  const { emitSelf, tracer } = h

  const startSignal = tracer.collect(new StartSignal({ args }))

  if (!initialOrderFilled) {
    return emitSelf('submit_initial_order', startSignal)
  }

  return emitSelf('submit_oco_order', startSignal)
}

module.exports = onLifeStart
