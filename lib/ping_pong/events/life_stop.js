'use strict'

/**
 * Cancels all open orders prior to teardown.
 *
 * @memberof module:bfx-hf-algo/PingPong
 * @listens module:bfx-hf-algo.AOHost~lifeStop
 *
 * @param {module:bfx-hf-algo.AOInstance} instance - AO instance
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
