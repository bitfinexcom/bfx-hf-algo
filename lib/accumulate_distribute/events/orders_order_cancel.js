'use strict'

/**
 * Triggered on atomic order cancellation; clears the tick timeout and cancels
 * any remaining orders, before triggering the `exec:stop` event & teardown
 *
 * @memberOf module:AccumulateDistribute
 * @listens AOHost~event:ordersOrderCancel
 *
 * @param {AOInstance} instance - AO instance state
 * @param {object} order - the order that was cancelled externally
 * @returns {Promise} p
 */
const onOrdersOrderCancel = async (instance = {}, order) => {
  const { h = {} } = instance
  const { emit, debug } = h

  debug('detected atomic cancelation, stopping...')

  return emit('exec:stop')
}

module.exports = onOrdersOrderCancel
