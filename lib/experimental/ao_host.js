'use strict'

const { EventEmitter2 } = require('eventemitter2')
const { EventEmitter } = require('events')
const { Manager } = require('bfx-api-node-core')
const { nonce } = require('bfx-api-node-util')
const _isFunction = require('lodash/isFunction')
const _get = require('lodash/get')
const debug = require('debug')('bfx:hf:algo:ao-host')
const {
  cancelOrderWithDelay, submitOrderWithDelay
} = require('bfx-api-node-core')

const genHelpers = require('./host/gen_helpers')

module.exports = class AOHost extends EventEmitter {
  constructor (args = {}) {
    super()

    const { apiKey, apiSecret, agent, url, aos } = args

    this.aos = aos
    this.instances = {}

    this.m = new Manager({
      apiSecret,
      apiKey,
      agent,
      url,
    })

    // NOTE: Auto-open/auth
    this.m.openWS()
    this.m.once('open', this.m.auth.bind(this.m))

    this.on('ao:start', this.onAOStart.bind(this))
    this.on('ao:start', this.onAOStop.bind(this))
  }

  getAO (id) {
    return Object.values(this.aos).find(ao => ao.id === id)
  }

  startAO (id, args = {}) {
    const ao = this.getAO(id)

    if (!ao) {
      throw new Error('unknown algo order: %s', id)
    }

    const {
      validateParams, processParams, initState, declareEvents
    } = ao.meta || {}

    if (_isFunction(validateParams)) {
      const vError = validateParams(args)

      if (vError) {
        throw new Error(vError)
      }
    }

    const params = _isFunction(processParams)
      ? processParams(args)
      : args

    const state = _isFunction(initState)
      ? initState(params)
      : {}

    const gid = nonce()

    state.ws = this.m.getWS(0)
    state.id = id
    state.gid = gid
    state.ev = new EventEmitter2({
      wildcard: true,
      delimiter: ':'
    })

    const h = genHelpers(state)
    this.instances[gid] = { state, h }

    state.ev.on('exec:order:submit:all', this.onAOSubmitAllOrders.bind(this))
    state.ev.on('exec:order:cancel:all', this.onAOCancelAllOrders.bind(this))

    if (_isFunction(declareEvents)) {
      declareEvents(this.instances[gid], this)
    }

    this.emit('ao:start', this.instances[gid])
  }

  onAOSubmitAllOrders (gid, orders, delay) {
    this.withAOUpdate(gid, (state = {}) => {
      let nextState = state

      for (let i = 0; i < orders.length; i += 1) {
        const o = orders[i]
        let nextState = submitOrderWithDelay(nextState, delay, o)
      }

      return nextState
    })
  }

  // TODO: Extract all event handlers, use aoHostState (state)
  onAOCancelAllOrders (gid, orders, delay) {
    this.withAOUpdate(gid, (state = {}) => {
      let nextState = state

      for (let i = 0; i < orders.length; i += 1) {
        const o = orders[i]
        let nextState = cancelOrderWithDelay(nextState, delay, o)
      }

      return nextState
    })
  }

  async withAOUpdate (gid, cb) {
    if (!this.instances[gid]) {
      throw new Error('unknown AO gid: %s', gid)
    }

    this.instances[gid] = await cb(this.instances[gid])
  }

  onAOSelfEvent (instance, eName, ...args) {
    return this.triggerAOEvent(instance, 'self', eName, ...args)
  }

  async onAOStart (instance) {
    return this.triggerAOEvent(instance, 'life', 'start')
  }

  async onAOStop (instance) {
    return this.triggerAOEvent(instance, 'life', 'stop')
  }

  async triggerAOEvent (instance, section, eventName, ...args) {
    const { state, h } = instance
    const { id, gid } = state

    debug(
      'triggering %s:%s for AO %s [gid %s]',
      section, eventName, id, gid
    )

    const ao = this.getAO(id)
    const sectionHandlers = (ao.events || {})[section]
    const handler = _get((sectionHandlers || {}), eventName)

    if (!_isFunction(handler)) {
      return
    }

    this.instances[gid] = await handler(state, h, ...args)
  }
}
