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
  const { args = {}, orders = {}, gid } = state
  const { debouncedSubmitOrders, emit, debug } = h
  const { cancelDelay } = args

  debouncedSubmitOrders.cancel()

  debug('detected iceberg algo cancelation, stopping...')

  await emit('exec:order:cancel:all', gid, orders, cancelDelay)
}

module.exports = onLifeStop
