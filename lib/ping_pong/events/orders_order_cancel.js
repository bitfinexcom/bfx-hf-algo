'use strict'

const { OrderCancelledSignal } = require('bfx-hf-signals/lib/types')

/**
 * Triggered when an atomic order cancellation is detected, and cancels any
 * open orders before emitting an `exec:stop` event to trigger teardown.
 *
 * @memberOf module:PingPong
 * @listens AOHost~ordersOrderCancel
 *
 * @param {AOInstance} instance - AO instance
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
