'use strict'

/**
 * Cancels any pending order submits prior to teardown
 *
 * @memberOf module:Iceberg
 * @listens AOHost~lifeStop
 *
 * @param {AOInstance} instance - AO instance
 */
const onLifeStop = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { orders = {}, gid, timeout } = state
  const { debouncedSubmitOrders, emit, debug, updateState } = h

  debouncedSubmitOrders.cancel()

  debug('detected iceberg algo cancelation, stopping...')

  if (timeout !== null) {
    clearTimeout(timeout)
    await updateState(instance, { timeout: null })
    debug('cleared timeout')
  }

  await emit('exec:order:cancel:all', gid, orders)
}

module.exports = onLifeStop
