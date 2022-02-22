'use strict'

const { types: { StopSignal, CancelAllSignal } } = require('bfx-hf-signals')

/**
 * Cancels any pending order submits prior to teardown
 *
 * @memberOf module:Iceberg
 * @listens AOHost~lifeStop
 *
 * @param {AOInstance} instance - AO instance
 * @param {object} opts
 */
const onLifeStop = async (instance = {}, opts = {}) => {
  const { state = {}, h = {} } = instance
  const { orders = {}, gid, timeout } = state
  const { debouncedSubmitOrders, emit, debug, updateState, tracer } = h
  const { origin } = opts

  debouncedSubmitOrders.cancel()

  debug('detected iceberg algo cancellation, stopping...')

  if (timeout !== null) {
    clearTimeout(timeout)
    await updateState(instance, { timeout: null })
    debug('cleared timeout')
  }

  const stopSignal = tracer.collect(new StopSignal(origin))

  tracer.collect(new CancelAllSignal(stopSignal))
  await emit('exec:order:cancel:all', gid, orders)
}

module.exports = onLifeStop
