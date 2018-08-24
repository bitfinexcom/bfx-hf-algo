'use strict'

module.exports = async (state = {}, h = {}) => {
  const { args = {}, orders = {}, gid } = state
  const { emit } = h
  const { cancelDelay } = args

  emit('exec:order:cancel:all', gid, orders, cancelDelay)
}
