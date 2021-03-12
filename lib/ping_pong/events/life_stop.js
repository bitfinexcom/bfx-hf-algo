'use strict'

/**
 * Cancels all open orders prior to teardown.
 *
 * @memberOf module:PingPong
 * @listens AOHost~lifeStop
 *
 * @param {AOInstance} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onLifeStop = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { orders = {}, gid } = state
  const { emit, debug } = h

  debug('detected ping/pong algo cancelation, stopping...')

  return emit('exec:order:cancel:all', gid, orders)
}

module.exports = onLifeStop
