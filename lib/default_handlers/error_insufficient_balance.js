'use strict'

const Promise = require('bluebird')

// How long orders are allowed to settle for before teardown
const TEARDOWN_GRACE_PERIOD_MS = 1 * 1000

/**
 * Cancel the AO if we try to submit an order without having enough balance
 *
 * @param {Object} instance
 * @param {Order} order - order which is below the min size for its symbol
 */
module.exports = async (instance = {}, o, notification) => {
  const { state = {}, h = {} } = instance
  const { gid, args = {}, orders = {} } = state
  const { emit, debug, notifyUI } = h
  const { cancelDelay } = args
  const { text } = notification

  debug('received insufficient balance error for order: %f @ %f', o.amountOrig, o.price)
  debug('stopping order...')

  await notifyUI('error', text)

  await emit('exec:stop', async () => {
    await Promise.delay(TEARDOWN_GRACE_PERIOD_MS)
    await emit('exec:order:cancel:all', gid, orders, cancelDelay)
  })
}
