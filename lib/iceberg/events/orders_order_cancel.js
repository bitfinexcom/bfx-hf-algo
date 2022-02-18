'use strict'

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
  const { id, cid, gid } = order || {}

  debug('detected atomic cancellation, stopping...')

  const signal = tracer.createSignal('order_cancelled', null, {
    order: { id, cid, gid }
  })

  await emit('exec:stop', null, { origin: signal })
}

module.exports = onOrdersOrderCancel
