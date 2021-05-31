'use strict'

/**
 * Stub to conform to the algo order schema.
 *
 * @memberOf module:OCOCO
 * @listens AOHost~lifeStop
 *
 * @param {AOInstance} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onLifeStop = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { orders = {}, gid, initialOrderFilled } = state
  const { emit, debug } = h

  debug('detected ococo algo cancelation, stopping...')

  if (!initialOrderFilled) {
    await emit('exec:order:cancel:all', gid, orders)
    return
  }

  await emit('exec:order:cancel:gid', gid)
}

module.exports = onLifeStop
