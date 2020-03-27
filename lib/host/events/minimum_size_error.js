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

  if (!instance) {
    return
  }

  /**
   * Triggered when an order fails due to being below the minimum size for that
   * market.
   *
   * @event AOHost~errorsMinimumSize
   * @param {object} order - the order that failed
   * @param {object} notification - the incoming notification
   */
  aoHost.triggerAOEvent(instance, 'errors', 'minimum_size', order, notification)
}
