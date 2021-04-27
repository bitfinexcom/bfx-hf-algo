'use strict'

const _isObject = require('lodash/isObject')

/**
 * Calls the provided cb with the current instance state by gid, and
 * saves the result as the new instance state.
 *
 * @param {object} aoHost - algo host
 * @param {string} gid - AO instance gid
 * @param {Function} cb - async method to call
 * @returns {object} nextInstanceState
 */
module.exports = async (aoHost, gid, cb) => {
  const { instances } = aoHost
  const instance = instances[gid]

  if (!instance) {
    return
  }

  const state = await cb(instance)

  if (_isObject(state)) {
    instance.state = state

    await aoHost.emit('ao:persist', gid)
  }

  return state
}
