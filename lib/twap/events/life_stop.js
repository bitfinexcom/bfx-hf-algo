'use strict'

/**
 * Clears the tick interval prior to teardown
 *
 * @memberOf module:TWAP
 * @listens AOHost~lifeStop
 *
 * @param {object} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onLifeStop = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { timeout, gid, orders } = state
  const { debug, updateState, emit } = h

  await updateState(instance, { shutdown: true })

  if (timeout !== null) {
    clearTimeout(timeout)
    await updateState(instance, { timeout: null })
    debug('cleared interval/timeout')
  }

  await emit('exec:order:cancel:all', gid, orders, 0)
}

module.exports = onLifeStop
