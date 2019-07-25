'use strict'

const debug = require('debug')('bfx:hf:host:register-ao-uis')
const _isFunction = require('lodash/isFunction')

const { PLATFORM = 'bitfinex' } = process.env

/**
 * Registers all order form layouts for the provided AO Host
 *
 * @param {Object} aoHost - algo order host
 */
module.exports = async (aoHost = {}, label = null) => {
  const { aos, m } = aoHost
  const { rest } = m
  const uis = Object.values(aos).filter((ao = {}) => {
    const { meta = {} } = ao
    const { getUIDef } = meta

    return _isFunction(getUIDef)
  }).map((ao = {}) => {
    const { meta = {} } = ao
    const { getUIDef } = meta
    const { id } = ao

    return { id, getUIDef }
  })

  if (uis.length === 0) {
    debug('no UIs to register')
    return
  }

  // NOTE: We overwrite all existing AOs
  // TODO: Add a migration feature; in the past, AO IDs were changed, so this
  //       overwrite is required to prevent duplicates.
  const aoSettings = {}

  uis.forEach(({ id, getUIDef }) => {
    aoSettings[id] = getUIDef()
    if (aoSettings && aoSettings[id].label === label) {
     if (aoSettings[id] !== null || aoSettings[id] !== undefined) {
      delete aoSettings[id] 
    } else  {
      aoSettings[id] = getUIDef()
    }
     return 
    }
  })

  return rest.updateSettings({
    [`api:${PLATFORM}_algorithmic_orders`]: aoSettings
  }).then(() => {
    debug('all UIs registered!')
  })
}
