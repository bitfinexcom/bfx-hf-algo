'use strict'

module.exports = async (aoHost, gid, type, filter) => {
  await withAOUpdate(aoHost, gid, async (instance = {}) => {
    const { state = {}, h = {} } = instance

    // TODO: Unsub, update ws state, etc

    return state
  })
}