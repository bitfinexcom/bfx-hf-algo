'use strict'

const _isFunction = require('lodash/isFunction')

/**
 * Stops execution of an algo order, and deletes it
 *
 * @param {object} aoHost - algo host
 * @param {string} gid - AO instance GID to operate on
 * @param {Function?} onCleanup - called before the instance is destroyed
 * @param {object} opts - extra options required for stopping algo host
 */
module.exports = async (aoHost, gid, onCleanup, opts) => {
  const inst = aoHost.instances[gid]

  if (!inst) { // instance may have already stopped
    return
  }

  // Prevent further AO operations, but allow order cancellations
  inst.state.ev.removeAllListeners(/exec:order:cancel/, true)

  // Handle AO-specific cleanup tasks
  if (_isFunction(onCleanup)) {
    await onCleanup()
  }

  // Let the host teardown (unsubs from channels, persists, etc)
  await aoHost.emit('ao:stop', inst, opts)

  // implode
  delete aoHost.instances[gid]
}
