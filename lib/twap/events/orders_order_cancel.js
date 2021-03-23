'use strict'

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
  const { emit, debug } = h

  debug('detected atomic cancelation, stopping...')

  await emit('exec:stop')
}

module.exports = onOrdersOrderCancel
