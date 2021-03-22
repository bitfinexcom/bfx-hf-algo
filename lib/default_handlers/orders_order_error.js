'use strict'

const Promise = require('bluebird')
const { TEARDOWN_GRACE_PERIOD_MS } = require('../ao_host')

/**
 * Called when a generic order error event is received. Emits an `'exec:stop'`
 * event and cancels open orders after the teardown grace period.
 *
 * Mapped to the `orders:order_error` event.
 *
 * @memberOf module:DefaultErrorHandlers
 * @listens AOHost~event:ordersOrderError
 *
 * @param {object} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onOrdersOrderError = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { gid, orders = {} } = state
  const { emit, debug } = h

  debug('receive generic order error event')
  debug('stopping order...')

  return emit('exec:stop', async () => {
    await Promise.delay(TEARDOWN_GRACE_PERIOD_MS)
    await emit('exec:order:cancel:all', gid, orders)
  })
}

module.exports = onOrdersOrderError
