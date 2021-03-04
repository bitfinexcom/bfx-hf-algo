'use strict'

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
  const { initialOrderFilled } = state
  const { emitSelf } = h

  if (!initialOrderFilled) {
    return emitSelf('submit_initial_order')
  }

  return emitSelf('submit_oco_order')
}

module.exports = onLifeStart
