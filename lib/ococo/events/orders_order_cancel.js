'use strict'

const { OrderCancelledSignal } = require('bfx-hf-signals/lib/types')

/**
 * Triggered on atomic order cancellation; cancels any open orders and triggers
 * the `'exec:stop'` event & teardown.
 *
 * @memberOf module:OCOCO
 * @listens AOHost~ordersOrderCancel
 *
 * @param {AOInstance} instance - AO instance state
 * @param {object} order - the order that was cancelled externally
 */
const onOrdersOrderCancel = async (instance = {}, order) => {
  const { h = {} } = instance
  const { emit, debug, tracer } = h

  debug('detected atomic cancellation, stopping...')

  const signal = tracer.collect(new OrderCancelledSignal(order))

  await emit('exec:stop', null, { origin: signal })
}

module.exports = onOrdersOrderCancel
