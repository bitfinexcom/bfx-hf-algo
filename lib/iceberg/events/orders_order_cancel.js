'use strict'

/**
 * Called when an atomic order cancellation is detected. Cancels any open
 * orders and emits the `'exec:stop'` event.
 *
 * @memberof module:bfx-hf-algo/Iceberg
 * @listens AOHost~ordersOrderCancel
 *
 * @param {AOInstance} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onOrdersOrderCancel = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { args = {}, orders = {}, gid } = state
  const { emit, debug } = h
  const { cancelDelay } = args

  debug('detected atomic cancelation, stopping...')

  await emit('exec:order:cancel:all', gid, orders, cancelDelay)
  return emit('exec:stop')
}

module.exports = onOrdersOrderCancel
