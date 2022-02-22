'use strict'

const { types: { OrderCancelledSignal } } = require('bfx-hf-signals')

/**
 * Triggered when an atomic order cancellation is detected; cancels any open
 * orders and emits the `exec:stop` event to trigger teardown.
 *
 * Mapped to the `orders:order_cancel` event.
 *
 * @memberOf module:TWAP
 * @listens AOHost~ordersOrderCancel
 *
 * @param {object} instance - AO instance
 * @param {object} order - the order that was cancelled
 * @returns {Promise} p - resolves on completion
 */
const onOrdersOrderCancel = async (instance = {}, order) => {
  const { h = {} } = instance
  const { emit, debug, tracer } = h

  debug('detected atomic cancellation, stopping...')

  const signal = tracer.collect(new OrderCancelledSignal(order))

  await emit('exec:stop', null, { origin: signal })
}

module.exports = onOrdersOrderCancel
