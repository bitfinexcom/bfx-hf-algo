'use strict'

const { StopSignal, CancelAllSignal, CancelOrderSignal } = require('bfx-hf-signals/lib/types')

/**
 * Stub to conform to the algo order schema.
 *
 * @memberOf module:Bracket
 * @listens AOHost~lifeStop
 *
 * @param {AOInstance} instance - AO instance
 * @param {Object} opts
 * @returns {Promise} p - resolves on completion
 */
const onLifeStop = async (instance = {}, opts = {}) => {
  const { state = {}, h = {} } = instance
  const { orders = {}, gid, initialOrderFilled } = state
  const { emit, debug, tracer } = h
  const { origin } = opts

  debug('detected bracket algo cancellation, stopping...')

  const stopSignal = tracer.collect(new StopSignal(origin, { initialOrderFilled }))

  if (!initialOrderFilled) {
    tracer.collect(new CancelAllSignal(stopSignal, { gid, orders }))
    await emit('exec:order:cancel:all', gid, orders)
    return
  }

  tracer.collect(new CancelOrderSignal(stopSignal, { gid }))
  await emit('exec:order:cancel:gid', gid)
}

module.exports = onLifeStop
