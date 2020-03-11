'use strict'

/**
 * Submits the initial order as configured within the execution parameters
 *
 * Mapped to the `'life:start'` event.
 *
 * @memberOf module:OCOCO
 * @param {object} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onLifeStart = async (instance = {}) => {
  const { h = {} } = instance
  const { emitSelf } = h

  return emitSelf('submit_initial_order')
}

module.exports = onLifeStart
