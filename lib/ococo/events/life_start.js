'use strict'

/**
 * Submits the initial order as configured within the execution parameters
 *
 * @memberof module:bfx-hf-algo/OCOCO
 * @listens module:bfx-hf-algo.AOHost~lifeStart
 * @see module:bfx-hf-algo/OCOCO.onSelfSubmitInitialOrder
 *
 * @param {module:bfx-hf-algo.AOInstance} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onLifeStart = async (instance = {}) => {
  const { h = {} } = instance
  const { emitSelf } = h

  return emitSelf('submit_initial_order')
}

module.exports = onLifeStart
