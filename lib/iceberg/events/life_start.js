'use strict'

const _debounce = require('lodash/debounce')

/**
 * @memberOf module:Iceberg
 * @emits module:Iceberg~selfSubmitOrders
 * @listens AOHost~lifeStart
 * @see module:Iceberg.onSelfSubmitOrders
 *
 * @param {AOInstance} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onLifeStart = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { args = {} } = state
  const { emitSelf, tracer } = h

  // Needs to be debounced, in case both orders are filled simultaneously,
  // triggering two submits in a row
  h.debouncedSubmitOrders = _debounce((origin) => {
    emitSelf('submit_orders', origin)
  }, 500)

  const startSignal = tracer.createSignal('start', null, { args })

  emitSelf('submit_orders', startSignal)
}

module.exports = onLifeStart
