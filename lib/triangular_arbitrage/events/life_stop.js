'use strict'

module.exports = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { args = {}, orders = {}, gid } = state
  const { emit } = h
  const { cancelDelay } = args

  await emit('exec:order:cancel:all', gid, orders, cancelDelay)
}
