'use strict'

/**
 * Cancel the AO if we try to submit an order below the minimum size, since it
 * means the remaining amount is below the min size (and therefore cannot fill)
 *
 * @param {Object} instance
 * @param {Order} order - order which is below the min size for its symbol
 */
module.exports = async (instance = {}, o) => {
  const { state = {}, h = {} } = instance
  const { gid, args = {}, orders = {} } = state
  const { emit, debug } = h
  const { cancelDelay } = args

  debug('received minimum size error for order: %f @ %f', o.amountOrig, o.price)
  debug('stopping order...')

  await emit('exec:order:cancel:all', gid, orders, cancelDelay)
  await emit('exec:stop')
}
