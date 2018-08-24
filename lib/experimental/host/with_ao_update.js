'use strict'

/**
 * Calls the provided cb with the current instance state by gid, and
 * saves the result as the new instance state.
 *
 * @param {Object} aoState
 * @param {string} gid - AO instance gid
 * @param {Function} cb - async method to call
 * @return {Object} nextInstanceState
 */
module.exports = async (aoHost, gid, cb) => {
  const { instances } = aoHost

  if (!instances[gid]) {
    throw new Error('unknown AO gid: %s', gid)
  }

  instances[gid] = await cb(instances[gid])
  return instances[gid]
}
