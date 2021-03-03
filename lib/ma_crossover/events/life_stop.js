'use strict'

/**
 * Stub to conform to the algo order schema.
 *
 * @memberOf module:MACrossover
 * @listens AOHost~lifeStop
 * @param {AOInstance} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onLifeStop = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { args = {}, orders = {}, gid } = state
  const { emit, debug } = h
  const { cancelDelay } = args

  debug('detected ma crossover algo cancelation, stopping...')

  await emit('exec:order:cancel:all', gid, orders, cancelDelay)
}

module.exports = onLifeStop
