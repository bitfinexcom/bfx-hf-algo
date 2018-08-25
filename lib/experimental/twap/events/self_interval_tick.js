'use strict'

// TODO: Move args onto instance, off of state
module.exports = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { orders = {}, args = {} } = state
  const { tradeBeyondEnd, cancelDelay } = args
  const { emit } = h

  if (!tradeBeyondEnd) {
    await emit('exec:orders:cancel:all', instance, cancelDelay, orders)
  }
}
