'use strict'

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
  const { state = {}, h = {} } = instance
  const { orders = {}, gid } = state
  const { emit, debug } = h

  debug('detected atomic cancelation, stopping...')

  await emit('exec:order:cancel:all', gid, orders)
  await emit('exec:stop')
}

module.exports = onOrdersOrderCancel
