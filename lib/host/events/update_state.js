'use strict'

const withAOUpdate = require('../with_ao_update')

/**
 * @param {object} aoHost - algo host
 * @param {string} gid - AO instance GID to operate on
 * @param {string} update - state update
 */
module.exports = async (aoHost, gid, update = {}) => {
  await withAOUpdate(aoHost, gid, async (instance = {}) => {
    const { state = {} } = instance

    return {
      ...state,
      ...update
    }
  })
}
