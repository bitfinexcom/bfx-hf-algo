'use strict'

/**
 * Triggered when an atomic order cancellation is detected, and cancels any
 * open orders before emitting an `exec:stop` event to trigger teardown.
 *
 * @memberOf module:PingPong
 * @listens module:bfx-hf-algo.AOHost~ordersOrderCancel
 *
 * @param {module:bfx-hf-algo.AOInstance} instance - AO instance
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
