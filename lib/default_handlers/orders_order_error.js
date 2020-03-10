'use strict'

const Promise = require('bluebird')

// How long orders are allowed to settle for before teardown
const TEARDOWN_GRACE_PERIOD_MS = 1 * 1000

/**
 * @param {object} instance
 */
module.exports = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { gid, args = {}, orders = {} } = state
  const { emit, debug } = h
  const { cancelDelay } = args

  debug('receive generic order error event')
  debug('stopping order...')

  await emit('exec:stop', async () => {
    await Promise.delay(TEARDOWN_GRACE_PERIOD_MS)
    await emit('exec:order:cancel:all', gid, orders, cancelDelay)
  })
}
