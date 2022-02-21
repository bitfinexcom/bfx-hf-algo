'use strict'

/**
 * Clears the tick interval prior to teardown
 *
 * @memberOf module:TWAP
 * @listens AOHost~lifeStop
 *
 * @param {AoInstance} instance - AO instance
 * @param {object} opts
 * @returns {Promise} p - resolves on completion
 */
const onLifeStop = async (instance = {}, opts = {}) => {
  const { state = {}, h = {} } = instance
  const { timeout, gid, orders } = state
  const { debug, updateState, emit, tracer } = h
  const { origin } = opts

  await updateState(instance, { shutdown: true })

  if (timeout !== null) {
    clearTimeout(timeout)
    await updateState(instance, { timeout: null })
    debug('cleared interval/timeout')
  }

  const stopSignal = tracer.createSignal('stop', origin)
  tracer.createSignal('cancel_all', stopSignal)

  await emit('exec:order:cancel:all', gid, orders)
}

module.exports = onLifeStop
