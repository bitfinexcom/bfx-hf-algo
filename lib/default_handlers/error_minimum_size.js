'use strict'

const Promise = require('bluebird')
const { TEARDOWN_GRACE_PERIOD_MS } = require('../ao_host')

/**
 * Called when a minimum order size error is received. Emits an `'exec:stop'`
 * event and cancels all orders after the teardown grace period.
 *
 * Mapped to the `error:minimum_size` event.
 *
 * @memberOf module:DefaultErrorHandlers
 * @listens module:bfx-hf-algo.AOHost~event:errorsMinimumSize
 *
 * @param {object} instance - AO instance
 * @param {object} order - order which is below the min size for its symbol
 * @param {object} notification - barebones notification object from BFX
 * @param {string} notification.text - original notification text
 * @returns {Promise} p - resolves on completion
 */
const onErrorMinimumSize = async (instance = {}, order, notification) => {
  const { state = {}, h = {} } = instance
  const { gid, args = {}, orders = {} } = state
  const { emit, debug, notifyUI } = h
  const { cancelDelay } = args
  const { text } = notification
  const { amountOrig, price } = order

  debug('received minimum size error for order: %f @ %f', amountOrig, price)
  debug('stopping order...')

  await notifyUI('error', text)

  return emit('exec:stop', async () => {
    await Promise.delay(TEARDOWN_GRACE_PERIOD_MS)
    await emit('exec:order:cancel:all', gid, orders, cancelDelay)
  })
}

module.exports = onErrorMinimumSize
