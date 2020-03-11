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
  const { args = {}, orders = {}, gid } = state
  const { emit } = h
  const { cancelDelay } = args

  return emit('exec:order:cancel:all', gid, orders, cancelDelay)
}

module.exports = onLifeStop
