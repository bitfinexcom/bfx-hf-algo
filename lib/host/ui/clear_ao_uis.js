'use strict'

const debug = require('debug')('bfx:hf:host:register-ao-uis')

const { PLATFORM = 'bitfinex' } = process.env

/**
 * Clears all order form layouts
 *
 * @param {Object} aoHost - algo order host
 */
module.exports = async (aoHost = {}) => {
  const { m } = aoHost
  const { rest } = m

  return rest
    .getSettings([`api:${PLATFORM}_algorithmic_orders`])
    .then(rest.updateSettings.bind(rest, ({
      [`api:${PLATFORM}_algorithmic_orders`]: {}
    }))).then(() => {
      debug('cleared all order layout definitions')
    })
}
