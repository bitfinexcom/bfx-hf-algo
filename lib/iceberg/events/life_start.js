'use strict'

const _debounce = require('lodash/debounce')

/**
 * @memberof module:bfx-hf-algo/Iceberg
 * @emits module:bfx-hf-algo/Iceberg~selfSubmitOrders
 * @listens module:bfx-hf-algo.AOHost~lifeStart
 * @see module:bfx-hf-algo/Iceberg.onSelfSubmitOrders
 *
 * @param {module:bfx-hf-algo.AOInstance} instance - AO instance
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

  await emitSelf('submit_orders')
}

module.exports = onLifeStart
