'use strict'

module.exports = async (aoHost, gid, order, notification) => {
  const instance = aoHost.getAOInstance(gid)

  if (!instance) {
    return
  }

  aoHost.triggerAOEvent(instance, 'errors', 'action_disabled', order, notification)
}
