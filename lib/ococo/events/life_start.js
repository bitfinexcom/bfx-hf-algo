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
  const { h = {} } = instance
  const { emitSelf } = h

  return emitSelf('submit_initial_order')
}

module.exports = onLifeStart
