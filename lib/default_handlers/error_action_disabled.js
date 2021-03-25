'use strict'

const Promise = require('bluebird')
const { TEARDOWN_GRACE_PERIOD_MS } = require('../ao_host')

const onErrorInvalidAction = async (instance = {}, order, notification) => {
  const { state = {}, h = {} } = instance
  const { gid, orders = {} } = state
  const { emit, debug, notifyUI } = h
  const { text } = notification
  const { amountOrig, price } = order

  debug('received action: disabled error for order: %f @ %f', amountOrig, price)
  debug('stopping order...')

  await notifyUI('error', text)

  return emit('exec:stop', async () => {
    await Promise.delay(TEARDOWN_GRACE_PERIOD_MS)
    await emit('exec:order:cancel:all', gid, orders)
  })
}

module.exports = onErrorInvalidAction
