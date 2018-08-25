'use strict'

const PI = require('p-iteration')
const { Manager } = require('bfx-api-node-core')
const { nonce } = require('bfx-api-node-util')
const _isFunction = require('lodash/isFunction')
const _includes = require('lodash/includes')
const _get = require('lodash/get')
const debug = require('debug')('bfx:hf:algo:ao-host')
const {
  cancelOrderWithDelay, submitOrderWithDelay
} = require('bfx-api-node-core')

const AsyncEventEmitter = require('./async_event_emitter')
const genHelpers = require('./host/gen_helpers')
const onSubmitAllOrders = require('./host/events/submit_all_orders')
const onCancelAllOrders = require('./host/events/cancel_all_orders')
const onUpdateState = require('./host/events/update_state')
const onSubscribeChannel = require('./host/events/subscribe_channel')
const onUnsubscribeChannel = require('./host/events/unsubscribe_channel')

module.exports = class AOHost extends AsyncEventEmitter {
  constructor (args = {}) {
    super()

    const { apiKey, apiSecret, agent, wsURL, restURL, aos } = args

    this.aos = aos
    this.instances = {}

    this.m = new Manager({
      transform: true,
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

    this.m.on('ws2:open', async () => {
      await this.emit('open')
    })

    this.m.on('ws2:event:auth:error', async (packet, meta) => {
      await this.emit('ws2:auth:error', packet, meta)
    })

    this.m.on('ws2:event:auth:success', async (packet, meta) => {
      await this.emit('ws2:auth:success', packet, meta)
    })

    this.m.on('ws2:auth:os', async (orders) => {
      await this.triggerGlobalEvent('orders', 'order_snapshot', orders)
    })

    this.m.on('ws2:auth:on', async (order) => {
      await this.triggerOrderEvent('orders', 'order_new', order)

      // TODO: Extract into helper
      const { status } = order

      if (status.indexOf('PARTIALLY') !== -1) {
        await this.triggerOrderEvent('orders', 'order_fill', order)
      }
    })

    this.m.on('ws2:auth:ou', async (order) => {
      await this.triggerOrderEvent('orders', 'order_update', order)

      // TODO: Extract into helper
      const { status } = order

      if (status.indexOf('PARTIALLY') !== -1) {
        await this.triggerOrderEvent('orders', 'order_fill', order)
      }
    })

    this.m.on('ws2:auth:oc', async (order) => {
      await this.triggerOrderEvent('orders', 'order_close', order)

      // TODO: Extract into helper
      const { status } = order

      if (status.indexOf('CANCELED') === -1) {
        await this.triggerOrderEvent('orders', 'order_fill', order)
      } else {
        await this.triggerOrderEvent('orders', 'order_cancel', order)
      }
    })

    this.m.on('ws2:data:trades', async (trades) => {
      await this.triggerGlobalEvent('data', 'trades', trades)
    })

    this.m.on('ws2:data:book', async (update) => {
      await this.triggerGlobalEvent('data', 'book', update)
    })

    this.on('ao:start', this.onAOStart.bind(this))
    this.on('ao:stop', this.onAOStop.bind(this))
  }

  connect () {
    this.m.openWS()
  }

  getAO (id) {
    return Object.values(this.aos).find(ao => ao.id === id)
  }

  async startAO (id, args = {}) {
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

    const initialState = _isFunction(initState)
      ? initState(params)
      : {}

    const gid = nonce()
    const state = {
      orders: {},
      ws: this.m.sampleWS(),
      id: id,
      gid: gid,
      ev: new AsyncEventEmitter(),

      ...initialState
    }

    const h = genHelpers(state)
    this.instances[gid] = { state, h }

    state.ev.on('channel:subscribe', onSubscribeChannel.bind(null, this))
    state.ev.on('channel:unsubscribe', onUnsubscribeChannel.bind(null, this))
    state.ev.on('state:update', onUpdateState.bind(null, this))
    state.ev.on('exec:order:submit:all', onSubmitAllOrders.bind(null, this))
    state.ev.on('exec:order:cancel:all', onCancelAllOrders.bind(null, this))
    state.ev.on('exec:stop', async () => {
      await this.emit('ao:stop', this.instances[gid])
      delete this.instances[gid] // implode
    })

    if (_isFunction(declareEvents)) {
      declareEvents(this.instances[gid], this)
    }

    await this.emit('ao:start', this.instances[gid])
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

  // Passes event to the AO instances that know the order
  async triggerOrderEvent (section, eventName, order) {
    const instances = Object.values(this.instances)

    await PI.forEach(instances, async (instance) => {
      const { state = {} } = instance
      const { orders = {}, id, gid } = state
      const cids = Object.keys(orders)

      if (_includes(cids, order.cid + '')) {
        debug(
          'triggering order event %s:%s for AO %s [gid %s, o cid %s]',
          section, eventName, id, gid, order.cid
        )

        await this.triggerAOEvent(instance, section, eventName, order)
      }
    })
  }

  async triggerGlobalEvent (section, eventName, ...args) {
    const instances = Object.values(this.instances)

    await PI.forEach(instances, async (instance) => (
      this.triggerAOEvent(instance, section, eventName, ...args)
    ))
  }

  async triggerAOEvent (instance, section, eventName, ...args) {
    const { state } = instance
    const { id, gid } = state

    debug(
      'triggering %s:%s for AO %s [gid %s]',
      section, eventName, id, gid
    )

    const ao = this.getAO(id)
    const sectionHandlers = (ao.events || {})[section]
    const handler = _get((sectionHandlers || {}), eventName)

    if (!_isFunction(handler)) {
      if (section === 'self') {
        debug('error: unknown handler %s:%s', section, eventName)
      }

      return
    }

    await handler(instance, ...args)
  }
}
