'use strict'

/**
 * Clears the tick timeout in preperation for teardown
 *
 * @memberOf module:AccumulateDistribute
 * @listens AOHost~event:lifeStop
 *
 * @param {AOInstance} instance - AO instance state
 * @returns {Promise} p
 */
const onLifeStop = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { timeout, args = {}, orders = {}, gid } = state
  const { debug, emit } = h
  const { cancelDelay } = args

  if (timeout) {
    clearTimeout(timeout)
  }

  debug('detected acccumulate/distribute algo cancelation, stopping...')

  await emit('exec:order:cancel:all', gid, orders, cancelDelay)
}

module.exports = onLifeStop
