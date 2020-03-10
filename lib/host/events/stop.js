'use strict'

const _isFunction = require('lodash/isFunction')

/**
 * Stops execution of an algo order, and deletes it
 *
 * @param {object} aoHost
 * @param {string} gid - AO instance GID to operate on
 * @param {Function?} onCleanup - called before the instance is destroyed
 */
module.exports = async (aoHost, gid, onCleanup) => {
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
  await aoHost.emit('ao:stop', inst)

  // implode
  delete aoHost.instances[gid]
}
