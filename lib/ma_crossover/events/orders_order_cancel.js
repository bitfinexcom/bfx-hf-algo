'use strict'

/**
 * Triggered when an atomic order cancellation is detected, cancels any open
 * orders and emits the `'exec:stop'` event.
 *
 * @memberof module:bfx-hf-algo/MACrossover
 * @listens module:bfx-hf-algo.AOHost~ordersOrderCancel
 *
 * @param {module:bfx-hf-algo.AOInstance} instance - AO instance
 * @param {object} order - order that was cancelled
 * @returns {Promise} p - resolves on completion
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
