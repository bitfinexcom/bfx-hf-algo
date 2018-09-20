'use strict'

const _isObject = require('lodash/isObject')
const withAOUpdate = require('../with_ao_update')

/**
 * Submits all provided orders with the specified delay, and adds them to the
 * AO instance state.
 *
 * @param {Object} aoHost
 * @param {string} gid - AO instance gid
 * @param {string} level - notification level, i.e. 'info', 'success', etc
 * @param {string} message
 * @return {Object} nextInstanceState
 */
module.exports = async (aoHost, gid, level, message) => {
  await withAOUpdate(aoHost, gid, async (instance = {}) => {
    const { state = {} } = instance
    const { ws: wsState = {} } = state
    const { ws } = wsState

    ws.send(JSON.stringify([0, 'n', null, {
      type: 'ucm-notify-ui',
      info: {
        level,
        message,
      },
    }]))

    return null
  })
}
