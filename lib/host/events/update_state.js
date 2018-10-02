'use strict'

const withAOUpdate = require('../with_ao_update')

module.exports = async (aoHost, gid, update = {}) => {
  await withAOUpdate(aoHost, gid, async (instance = {}) => {
    const { state = {} } = instance

    return {
      ...state,
      ...update
    }
  })
}
