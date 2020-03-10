'use strict'

const withAOUpdate = require('../with_ao_update')

/**
 * Meant to be write-only, channels are assigned before life:start, subscribed
 * to on life:start, and unsubscribed from on life:stop
 *
 * @param {object} aoHost
 * @param {string} gid - AO instance GID to operate on
 * @param {string} channel - i.e. 'ticker'
 * @param {object} filter - i.e. { symbol: 'tBTCUSD' }
 */
module.exports = async (aoHost, gid, channel, filter) => {
  return withAOUpdate(aoHost, gid, async (instance = {}) => {
    const { state = {} } = instance

    return {
      ...state,
      channels: [
        ...state.channels,
        { channel, filter }
      ]
    }
  })
}
