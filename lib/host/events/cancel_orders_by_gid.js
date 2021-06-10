'use strict'

const withAOUpdate = require('../with_ao_update')

/**
 * Cancel all orders using Group ID
 *
 * @param {object} aoHost - algo host
 * @param {string} gid - AO instance gid
 * @returns {object} nextInstanceState
 */
module.exports = async (aoHost, gid) => {
  return withAOUpdate(aoHost, gid, async (instance = {}) => {
    const { state = {}, h = {} } = instance
    const { cancelOrdersByGid, debug } = h

    debug('cancelling orders by gid [%s]', gid)

    const nextState = await cancelOrdersByGid(state, gid)

    return nextState
  })
}
