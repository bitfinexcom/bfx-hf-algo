'use strict'

module.exports = async (state = {}, h = {}) => {
  const { args = {}, orders = {} } = state
  const { emit } = h
  const { cancelDelay } = args

  emit('exec:order:cancel:all', gid, orders, cancelDelay)
}
