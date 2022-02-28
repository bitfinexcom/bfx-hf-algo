'use strict'

const { StopSignal, CancelAllSignal } = require('bfx-hf-signals/lib/types')
/**
 * Cancels all open orders prior to teardown.
 *
 * @memberOf module:PingPong
 * @listens AOHost~lifeStop
 *
 * @param {AOInstance} instance - AO instance
 * @param {Object} opts
 * @returns {Promise} p - resolves on completion
 */
const onLifeStop = async (instance = {}, opts = {}) => {
  const { state = {}, h = {} } = instance
  const { orders = {}, gid } = state
  const { emit, debug, tracer } = h
  const { origin } = opts

  const stopSignal = tracer.collect(new StopSignal(origin))

  debug('detected ping/pong algo cancellation, stopping...')

  tracer.collect(new CancelAllSignal(stopSignal))

  return emit('exec:order:cancel:all', gid, orders)
}

module.exports = onLifeStop
