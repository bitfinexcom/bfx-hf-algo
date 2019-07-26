'use strict'

/**
 * @param {Object} instance
 */
module.exports = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { gid, args = {}, orders = {} } = state
  const { emit, debug } = h
  const { cancelDelay } = args

  debug('receive generic order error event')
  debug('stopping order...')

  await emit('exec:order:cancel:all', gid, orders, cancelDelay)
  await emit('exec:stop')
}
