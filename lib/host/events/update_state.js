'use strict'

const withAOUpdate = require('../with_ao_update')

/**
 * @memberof AOHost
 * @private
 *
 * @param {AOHost} aoHost - algo host
 * @param {string} gid - AO instance GID to operate on
 * @param {string} update - state update
 */
const onUpdateState = async (aoHost, gid, update = {}) => {
  await withAOUpdate(aoHost, gid, async (instance = {}) => {
    const { state = {} } = instance

    return {
      ...state,
      ...update
    }
  })
}

module.exports = onUpdateState
