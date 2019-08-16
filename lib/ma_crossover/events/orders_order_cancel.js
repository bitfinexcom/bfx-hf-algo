'use strict'

module.exports = async (instance = {}, order) => {
  const { state = {}, h = {} } = instance
  const { args = {}, orders = {}, gid, timeout } = state
  const { emit, debug } = h
  const { cancelDelay } = args

  debug('detected atomic cancelation, stopping...')

  if (timeout) {
    clearTimeout(timeout)
  }

  await emit('exec:order:cancel:all', gid, orders, cancelDelay)
  await emit('exec:stop')
}
