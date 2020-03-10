'use strict'

const Promise = require('bluebird')

// How long orders are allowed to settle for before teardown
const TEARDOWN_GRACE_PERIOD_MS = 1 * 1000

/**
 * Cancel the AO if we try to submit an order below the minimum size, since it
 * means the remaining amount is below the min size (and therefore cannot fill)
 *
 * @param {object} instance
 * @param {Order} order - order which is below the min size for its symbol
 * @param {object} notification - barebones notification object from BFX
 * @param {object} notification.text - original notification text
 */
module.exports = async (instance = {}, o, notification) => {
  const { state = {}, h = {} } = instance
  const { gid, args = {}, orders = {} } = state
  const { emit, debug, notifyUI } = h
  const { cancelDelay } = args
  const { text } = notification

  debug('received minimum size error for order: %f @ %f', o.amountOrig, o.price)
  debug('stopping order...')

  await notifyUI('error', text)

  await emit('exec:stop', async () => {
    await Promise.delay(TEARDOWN_GRACE_PERIOD_MS)
    await emit('exec:order:cancel:all', gid, orders, cancelDelay)
  })
}
