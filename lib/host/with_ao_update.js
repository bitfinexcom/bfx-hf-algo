'use strict'

const _isObject = require('lodash/isObject')

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

  const state = await cb(instances[gid])

  if (_isObject(state)) {
    instances[gid].state = state

    await aoHost.emit('ao:persist', gid)
  }

  return state
}
