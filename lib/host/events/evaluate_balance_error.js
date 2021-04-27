'use strict'

/**
 * Propagates the error to all instances that have the relevant listener
 *
 * @param {object} aoHost - algo host
 * @param {string} gid - AO instance GID to operate on
 * @param {Order} order - the order that is below the minimum size for its sym
 * @param {Notification} notification - which reported the error
 */
module.exports = async (aoHost, gid, order, notification) => {
  const instance = aoHost.getAOInstance(gid)
  const { text } = notification

  if (!instance) {
    return
  }
  const { h = {} } = instance
  const { notifyUI } = h

  await notifyUI('error', text)
}
