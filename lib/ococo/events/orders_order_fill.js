'use strict'

const { Config } = require('bfx-api-node-core')
const { OrderFilledSignal } = require('bfx-hf-signals/lib/types')
const { DUST } = Config

/**
 * Called on atomic order fill. If it was the initial order, the OCO order
 * is submitted, otherwise the `'exec:stop'` event is emitted to trigger
 * teardown.
 *
 * @memberOf module:OCOCO
 * @listens AOHost~ordersOrderCancel
 *
 * @param {AOInstance} instance - AO instance
 * @param {object} order - the order that was filled
 * @returns {Promise} p - resolves on completion
 */
const onOrdersOrderFill = async (instance = {}, order) => {
  const { state = {}, h = {} } = instance
  const { updateState, emitSelf, tracer } = h
  const { initialOrderFilled } = state

  const fillSignal = tracer.collect(new OrderFilledSignal(order))
  fillSignal.meta.initialOrderFilled = initialOrderFilled

  if (order.amount > DUST) { // partial fill
    fillSignal.meta.partialFill = true
    return
  }

  if (initialOrderFilled) {
    await emitSelf('exec:stop', null, { origin: fillSignal })
  } else {
    await updateState(instance, { initialOrderFilled: true })
    await emitSelf('submit_oco_order', fillSignal)
  }
}

module.exports = onOrdersOrderFill
