'use strict'

const { Config } = require('bfx-api-node-core')
const { DUST } = Config

/**
 * Called on atomic order fill. If it was the initial order, the OCO order
 * is submitted, otherwise the `'exec:stop'` event is emitted to trigger
 * teardown.
 *
 * @memberof module:bfx-hf-algo/OCOCO
 * @listens AOHost~ordersOrderCancel
 *
 * @param {AOInstance} instance - AO instance
 * @param {object} order - the order that was filled
 * @returns {Promise} p - resolves on completion
 */
const onOrdersOrderFill = async (instance = {}, order) => {
  const { state = {}, h = {} } = instance
  const { updateState, emitSelf } = h
  const { initialOrderFilled } = state

  if (order.amount > DUST) { // partial fill
    return
  }

  if (initialOrderFilled) {
    await emitSelf('exec:stop')
  } else {
    await updateState(instance, { initialOrderFilled: true })
    await emitSelf('submit_oco_order')
  }
}

module.exports = onOrdersOrderFill
