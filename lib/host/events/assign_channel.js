'use strict'

const withAOUpdate = require('../with_ao_update')

/**
 * Meant to be write-only, channels are assigned before life:start, subscribed
 * to on life:start, and unsubscribed from on life:stop
 *
 * @param {Object} aoHost
 * @param {string} gid - AO instance GID to operate on
 * @param {string} channel - i.e. 'ticker'
 * @param {Object} filter - i.e. { symbol: 'tBTCUSD' }
 */
module.exports = async (aoHost, gid, channel, filter) => {
  await withAOUpdate(aoHost, gid, async (instance = {}) => {
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
