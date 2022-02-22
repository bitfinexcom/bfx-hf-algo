'use strict'

const { types: { OrderCancelledSignal } } = require('bfx-hf-signals')

/**
 * Called when an atomic order cancellation is detected. Cancels any open
 * orders and emits the `'exec:stop'` event.
 *
 * @memberOf module:Iceberg
 * @listens AOHost~ordersOrderCancel
 *
 * @param {AOInstance} instance - AO instance
 * @param {object} order - order that was cancelled
 * @return {Promise} p - resolves on completion
 */
const onOrdersOrderCancel = async (instance = {}, order) => {
  const { h = {} } = instance
  const { emit, debug, tracer } = h

  debug('detected atomic cancellation, stopping...')

  const signal = tracer.collect(new OrderCancelledSignal(order))

  await emit('exec:stop', null, { origin: signal })
}

module.exports = onOrdersOrderCancel
