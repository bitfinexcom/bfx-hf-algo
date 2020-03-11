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
  const { state = {}, h = {} } = instance
  const { args = {}, orders = {}, gid } = state
  const { emit, debug } = h
  const { cancelDelay } = args

  debug('detected atomic cancelation, stopping...')

  await emit('exec:order:cancel:all', gid, orders, cancelDelay)
  return emit('exec:stop')
}

module.exports = onOrdersOrderCancel
