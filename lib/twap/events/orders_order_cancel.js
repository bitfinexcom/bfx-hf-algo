'use strict'

/**
 * Triggered when an atomic order cancellation is detected; cancels any open
 * orders and emits the `exec:stop` event to trigger teardown.
 *
 * Mapped to the `orders:order_cancel` event.
 *
 * @memberof module:bfx-hf-algo/TWAP
 * @listens AOHost~ordersOrderCancel
 *
 * @param {object} instance - AO instance
 * @param {object} order - the order that was cancelled
 * @returns {Promise} p - resolves on completion
 */
const onOrdersOrderCancel = async (instance = {}, order) => {
  const { state = {}, h = {} } = instance
  const { args = {}, orders = {}, gid } = state
  const { emit, debug } = h
  const { cancelDelay } = args

  debug('detected atomic cancelation, stopping...')

  await emit('exec:order:cancel:all', gid, orders, cancelDelay)
  await emit('exec:stop')
}

module.exports = onOrdersOrderCancel
