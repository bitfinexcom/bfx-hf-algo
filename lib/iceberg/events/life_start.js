'use strict'

const _debounce = require('lodash/debounce')

/**
 * Emits the `'self:submit_orders'` event.
 *
 * Mapped to the `'life:start'` event.
 *
 * @memberOf module:Iceberg
 * @param {object} instance - AO instance
 * @returns {Promise} p - resolves on completion
 * @see module:Iceberg~onSelfSubmitOrders
 */
const onLifeStart = async (instance = {}) => {
  const { h = {} } = instance
  const { emitSelf } = h

  // Needs to be debounced, in case both orders are filled simultaneously,
  // triggering two submits in a row
  h.debouncedSubmitOrders = _debounce(() => {
    emitSelf('submit_orders')
  }, 500)

  await emitSelf('submit_orders')
}

module.exports = onLifeStart
