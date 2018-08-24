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
const onSubmitAllOrders = require('./host/events/submit_all_orders')
const onCancelAllOrders = require('./host/events/cancel_all_orders')

module.exports = class AOHost extends EventEmitter {
  constructor (args = {}) {
    super()

    const { apiKey, apiSecret, agent, wsURL, restURL, aos } = args

    this.aos = aos
    this.instances = {}

    this.m = new Manager({
      apiSecret,
      apiKey,
      agent,
      wsURL,
      restURL,
    })

    // NOTE: Auto-open/auth
    this.m.once('ws2:open', () => {
      this.m.auth({ dms: 4 })
    })

    this.m.on('ws2:open', () => this.emit('open'))
    this.m.on('ws2:event:auth:error', (packet, meta) => this.emit('ws2:auth:error', packet, meta))
    this.m.on('ws2:event:auth:success', (packet, meta) => this.emit('ws2:auth:success', packet, meta))

    this.on('ao:start', this.onAOStart.bind(this))
    this.on('ao:stop', this.onAOStop.bind(this))
  }

  connect () {
    this.m.openWS()
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

    state.ws = this.m.sampleWS()
    state.id = id
    state.gid = gid
    state.ev = new EventEmitter2({
      wildcard: true,
      delimiter: ':'
    })

    const h = genHelpers(state)
    this.instances[gid] = { state, h }

    state.ev.on('exec:order:submit:all', onSubmitAllOrders.bind(null, this))
    state.ev.on('exec:order:cancel:all', onCancelAllOrders.bind(null, this))

    if (_isFunction(declareEvents)) {
      declareEvents(this.instances[gid], this)
    }

    this.emit('ao:start', this.instances[gid])
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
      debug('error: unknown handler %s:%s', section, eventName)
      return
    }

    this.instances[gid] = await handler(state, h, ...args)
  }
}
