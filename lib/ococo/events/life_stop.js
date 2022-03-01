'use strict'

const { StopSignal, CancelAllSignal } = require('bfx-hf-signals/lib/types')

/**
 * Stub to conform to the algo order schema.
 *
 * @memberOf module:OCOCO
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

  debug('detected ococo algo cancellation, stopping...')

  const stopSignal = tracer.collect(new StopSignal(origin))

  tracer.collect(new CancelAllSignal(stopSignal, { initialOrderFilled, gid, orders }))

  if (!initialOrderFilled) {
    await emit('exec:order:cancel:all', gid, orders)
    return
  }

  await emit('exec:order:cancel:gid', gid)
}

module.exports = onLifeStop
