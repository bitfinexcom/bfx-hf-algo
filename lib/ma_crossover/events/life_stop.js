'use strict'

/**
 * Stub to conform to the algo order schema.
 *
 * @memberOf module:MACrossover
 * @listens AOHost~lifeStop
 * @param {AOInstance} instance - AO instance
 * @param {object} opts - options if required for algo order
 * @returns {Promise} p - resolves on completion
 */
const onLifeStop = async (instance = {}, opts = {}) => {
  const { state = {}, h = {} } = instance
  const { orders = {}, gid } = state
  const { emit, debug } = h
  const { keepOrdersOpen = false } = opts

  debug('detected ma crossover algo cancelation, stopping...')

  if (keepOrdersOpen) {
    debug('keeping ma crossover algo orders [gid %s] open...', gid)
    return
  }

  await emit('exec:order:cancel:all', gid, orders)
}

module.exports = onLifeStop
