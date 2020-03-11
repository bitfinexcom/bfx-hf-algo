'use strict'

const Promise = require('bluebird')
const { TEARDOWN_GRACE_PERIOD_MS } = require('../ao_host')

/**
 * Called when an insufficient balance notification is received. Emits an
 * `'exec:stop'` event and cancels all open orders after the teardown grace
 * period.
 *
 * Mapped to the `'error:insufficient_balance'` event.
 *
 * @memberOf module:DefaultErrorHandlers
 * @param {object} instance - AO instance
 * @param {object} order - order which is below the min size for its symbol
 * @param {object} notification - incoming error notification
 * @return {Promise} p - resolves on completion
 */
const onErrorInsufficientBalance = async (instance = {}, order, notification) => {
  const { state = {}, h = {} } = instance
  const { gid, args = {}, orders = {} } = state
  const { emit, debug, notifyUI } = h
  const { cancelDelay } = args
  const { text } = notification
  const { amountOrig, price } = order

  debug('received insufficient balance error for order: %f @ %f', amountOrig, price)
  debug('stopping order...')

  await notifyUI('error', text)

  return emit('exec:stop', async () => {
    await Promise.delay(TEARDOWN_GRACE_PERIOD_MS)
    await emit('exec:order:cancel:all', gid, orders, cancelDelay)
  })
}

module.exports = onErrorInsufficientBalance
