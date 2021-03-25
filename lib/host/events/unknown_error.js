'use strict'

module.exports = async (aoHost, gid, order, notification) => {
  const instance = aoHost.getAOInstance(gid)

  if (!instance) {
    return
  }

  aoHost.triggerAOEvent(instance, 'errors', 'unknown_error', order, notification)
}
