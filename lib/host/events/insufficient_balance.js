'use strict'

/**
 * Propagates the error to all instances that have the relevant listener
 *
 * @memberof AOHost
 * @private
 *
 * @param {AOHost} aoHost - algo host
 * @param {string} gid - AO instance GID to operate on
 * @param {bfx-api-node-models.Order} order - the order that failed due to
 *   insufficient balance
 * @param {bfx-api-node-models.Notification} notification - which reported the
 *   error
 */
const onInsufficientBalanceError = async (aoHost, gid, order, notification) => {
  const instance = aoHost.getAOInstance(gid)

  if (!instance) {
    return
  }

  /**
   * Triggered when an order fails due to have insufficient balance
   *
   * @event AOHost~errorsInsufficientBalance
   * @param {bfx-api-node-models.Order} order - the order that failed
   * @param {bfx-api-node-models.Notification} notification - the incoming
   *   notification
   */
  aoHost.triggerAOEvent(
    instance, 'errors', 'insufficient_balance', order, notification
  )
}

module.exports = onInsufficientBalanceError
