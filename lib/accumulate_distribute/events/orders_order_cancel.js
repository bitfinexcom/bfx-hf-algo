'use strict'

/**
 * Triggered on atomic order cancellation; clears the tick timeout and cancels
 * any remaining orders, before triggering the `exec:stop` event & teardown
 *
 * Mapped to the `orders:order_cancel` event.
 *
 * @memberOf module:AccumulateDistribute
 * @param {object} instance - AO instance state
 * @param {object} order - the order that was cancelled externally
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
  await emit('exec:stop')
}

module.exports = onOrdersOrderCancel
