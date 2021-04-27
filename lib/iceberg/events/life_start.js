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
  const { h = {} } = instance
  const { emitSelf } = h

  // Needs to be debounced, in case both orders are filled simultaneously,
  // triggering two submits in a row
  h.debouncedSubmitOrders = _debounce(() => {
    emitSelf('submit_orders')
  }, 500)

  emitSelf('submit_orders')
}

module.exports = onLifeStart
