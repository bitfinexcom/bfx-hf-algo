'use strict'

/**
 * Triggered when an atomic order cancellation is detected, cancels any open
 * orders and emits the `'exec:stop'` event.
 *
 * @memberOf module:MACrossover
 * @listens AOHost~ordersOrderCancel
 *
 * @param {AOInstance} instance - AO instance
 * @param {object} order - order that was cancelled
 * @returns {Promise} p - resolves on completion
 */
const onOrdersOrderCancel = async (instance = {}, order) => {
  const { h = {} } = instance
  const { emit, debug } = h

  debug('detected atomic cancelation, stopping...')

  return emit('exec:stop')
}

module.exports = onOrdersOrderCancel
