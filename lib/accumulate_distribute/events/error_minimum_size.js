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
  const { timeout } = state
  const { emit, debug } = h

  debug('received minimum size error for order: %f @ %f', o.amountOrig, o.price)
  debug('stopping order...')

  if (timeout) {
    clearTimeout(timeout)
  }

  await emit('exec:stop')
}
