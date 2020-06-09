'use strict'

/**
 * Triggered on atomic order cancellation; clears the tick timeout and cancels
 * any remaining orders, before triggering the `exec:stop` event & teardown
 *
 * @memberof module:bfx-hf-algo/AccumulateDistribute
 * @listens AOHost~event:ordersOrderCancel
 *
 * @param {AOInstance} instance - AO instance state
 * @param {object} order - the order that was cancelled externally
 * @returns {Promise} p
 */
const onOrdersOrderCancel = async (instance = {}, order) => {
  const { state = {}, h = {} } = instance
  const { args = {}, orders = {}, gid, timeout } = state
  const { emit, debug } = h
  const { cancelDelay } = args

  debug('detected atomic cancelation, stopping...')

  if (timeout) {
    clearTimeout(timeout)
  }

  await emit('exec:order:cancel:all', gid, orders, cancelDelay)
  return emit('exec:stop')
}

module.exports = onOrdersOrderCancel
