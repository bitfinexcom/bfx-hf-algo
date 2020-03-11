'use strict'

/**
 * Triggered on atomic order cancellation; cancels any open orders and triggers
 * the `'exec:stop'` event & teardown.
 *
 * @memberOf module:OCOCO
 * @listens AOHost~ordersOrderCancel
 *
 * @param {AOInstance} instance - AO instance state
 * @param {object} order - the order that was cancelled externally
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
