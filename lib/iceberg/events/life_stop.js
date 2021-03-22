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
  const { timeout } = state
  const { debouncedSubmitOrders, debug, updateState } = h

  debouncedSubmitOrders.cancel()

  if (timeout !== null) {
    clearTimeout(timeout)
    await updateState(instance, { timeout: null })
    debug('cleared timeout')
  }
}

module.exports = onLifeStop
