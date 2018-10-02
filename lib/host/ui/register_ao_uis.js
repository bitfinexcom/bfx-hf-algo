'use strict'

const debug = require('debug')('bfx:hf:host:register-ao-uis')
const _isFunction = require('lodash/isFunction')

module.exports = async (aoHost = {}) => {
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

  return rest.getSettings(['api:bitfinex_algorithmic_orders']).then((res = []) => {
    const [keyResult] = res
    const [, aoSettings = {}] = keyResult

    uis.forEach(({ id, getUIDef }) => {
      debug('registering UI %s', id)
      aoSettings[id] = getUIDef()
    })

    return rest.updateSettings({
      'api:bitfinex_algorithmic_orders': aoSettings
    })
  }).then(() => {
    debug('all UIs registered!')
  })
}
