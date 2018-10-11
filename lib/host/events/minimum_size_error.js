'use strict'

const withAOUpdate = require('../with_ao_update')

/**
 * Propagates the error to all instances that have the relevant listener
 *
 * @param {Object} aoHost
 * @param {string} gid - AO instance GID to operate on
 * @param {Order} order - the order that is below the minimum size for its sym
 * @param {Notification} notification - which reported the error
 */
module.exports = async (aoHost, gid, order, notification) => {
  const instance = aoHost.getAOInstance(gid)

  if (!instance) {
    throw new Error(`unknown AO instance: ${gid}`)
  }

  aoHost.triggerAOEvent(instance, 'errors', 'minimum_size', order, notification)
}
