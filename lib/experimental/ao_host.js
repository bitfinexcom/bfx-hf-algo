'use strict'

const PI = require('p-iteration')
const { Manager } = require('bfx-api-node-core')
const _isFunction = require('lodash/isFunction')
const _isEmpty = require('lodash/isEmpty')
const _isEqual = require('lodash/isEqual')
const _includes = require('lodash/includes')
const _get = require('lodash/get')
const _pick = require('lodash/pick')
const debug = require('debug')('bfx:hf:algo:ao-host')
const {
  subscribeWS, unsubscribeWS, findChannelId
} = require('bfx-api-node-core')

const ManagedOB = require('bfx-api-node-plugin-managed-ob')
const ManagedCandles = require('bfx-api-node-plugin-managed-candles')

const AsyncEventEmitter = require('./async_event_emitter')
const onSubmitAllOrders = require('./host/events/submit_all_orders')
const onCancelAllOrders = require('./host/events/cancel_all_orders')
const onUpdateState = require('./host/events/update_state')
const onAssignChannel = require('./host/events/assign_channel')
const withAOUpdate = require('./host/with_ao_update')
const bindWS2Bus = require('./host/ws2/bind_bus')
const initAO = require('./host/init_ao')

module.exports = class AOHost extends AsyncEventEmitter {
  constructor (args = {}) {
    super()

    const { apiKey, apiSecret, agent, wsURL, restURL, aos } = args

    this.aos = aos
    this.instances = {}
    this.onAOStart = this.onAOStart.bind(this)
    this.onAOStop = this.onAOStop.bind(this)
    this.triggerAOEvent = this.triggerAOEvent.bind(this)
    this.triggerGlobalEvent = this.triggerGlobalEvent.bind(this)
    this.triggerOrderEvent = this.triggerOrderEvent.bind(this)
    this.onWSTicker = this.onWSTicker.bind(this)
    this.onWSTrades = this.onWSTrades.bind(this)
    this.onWSCandles = this.onWSCandles.bind(this)
    this.onWSBook = this.onWSBook.bind(this)
    this.onWSManagedBook = this.onWSManagedBook.bind(this)
    this.onWSManagedCandles = this.onWSManagedCandles.bind(this)
    this.onSocketUpdate = this.onSocketUpdate.bind(this)

    this.m = new Manager({
      plugins: [ManagedOB(), ManagedCandles()],
      transform: true,
      apiSecret,
      apiKey,
      agent,
      wsURL,
      restURL
    })

    // NOTE: Auto-open/auth
    this.m.once('ws2:open', () => { this.m.auth({ dms: 4 }) })
    this.m.on('ws2:ticker', this.onWSTicker)
    this.m.on('ws2:trades', this.onWSTrades)
    this.m.on('ws2:candles', this.onWSCandles)
    this.m.on('ws2:book', this.onWSBook)
    this.m.on('ws2:managed:book', this.onWSManagedBook)
    this.m.on('ws2:managed:candles', this.onWSManagedCandles)
    this.m.on('socket:updated', this.onSocketUpdate)

    this.on('ao:start', this.onAOStart)
    this.on('ao:stop', this.onAOStop)

    bindWS2Bus(this)
  }

  // Update internal socket state when the manager applies an update
  onSocketUpdate (i, state) {
    Object.values(this.instances).forEach((instance = {}) => {
      const { wsi } = instance.state

      if (wsi === i) {
        instance.state.ws = state
      }
    })
  }

  connect () {
    this.m.openWS()
  }

  getAO (id) {
    return Object.values(this.aos).find(ao => ao.id === id)
  }

  onWSTicker (ticker, meta = {}) {
    this.triggerGlobalEvent('data', 'ticker', ticker, meta)
  }

  onWSTrades (trades, meta = {}) {
    this.triggerGlobalEvent('data', 'trades', trades, meta)
  }

  onWSCandles (candles, meta = {}) {
    this.triggerGlobalEvent('data', 'candles', candles, meta)
  }

  onWSBook (update, meta = {}) {
    this.triggerGlobalEvent('data', 'book', update, meta)
  }

  onWSManagedBook (book, meta = {}) {
    this.triggerGlobalEvent('data', 'managedBook', book, meta)
  }

  onWSManagedCandles (candles, meta = {}) {
    this.triggerGlobalEvent('data', 'managedCandles', candles, meta)
  }

  async startAO (id, args = {}) {
    const ao = this.getAO(id)

    if (!ao) {
      throw new Error('unknown algo order: %s', id)
    }

    const inst = initAO(ao, args)
    const { state } = inst
    const { gid } = state
    const wsi = this.m.sampleWSI()

    state.ws = this.m.getWSByIndex(wsi)
    state.wsi = wsi

    this.instances[gid] = inst

    state.ev.on('channel:assign', onAssignChannel.bind(null, this))
    state.ev.on('state:update', onUpdateState.bind(null, this))
    state.ev.on('exec:order:submit:all', onSubmitAllOrders.bind(null, this))
    state.ev.on('exec:order:cancel:all', onCancelAllOrders.bind(null, this))
    state.ev.on('exec:stop', async () => {
      await this.emit('ao:stop', this.instances[gid])
      delete this.instances[gid] // implode
    })

    const { declareEvents, declareChannels } = ao.meta || {}

    if (_isFunction(declareEvents)) {
      declareEvents(this.instances[gid], this)
    }

    if (_isFunction(declareChannels)) {
      await declareChannels(this.instances[gid], this)
    }

    await this.emit('ao:start', this.instances[gid])

    return gid
  }

  async stopAO (gid) {
    const instance = this.instances[gid]

    if (!instance) {
      throw new Error('unknown AO: %s', gid)
    }

    await this.emit('ao:stop', instance)
  }

  onAOSelfEvent (instance, eName, ...args) {
    return this.triggerAOEvent(instance, 'self', eName, ...args)
  }

  async onAOStart (instance = {}) {
    const { channels = [], gid } = instance.state

    // TODO: Extract, channel subscriptions
    if (!_isEmpty(channels)) {
      await withAOUpdate(this, gid, (instance = {}) => {
        const { state = {} } = instance
        let { ws } = state

        channels.forEach(ch => {
          debug('subscribing to channel %j [AO gid %d]', ch, gid)

          ws = subscribeWS(ws, ch.channel, ch.filter)
        })

        return {
          ...state,
          ws
        }
      })
    }

    return this.triggerAOEvent(instance, 'life', 'start')
  }

  async onAOStop (instance = {}) {
    const { channels = [], gid } = instance.state

    // TODO: Extract, channel unsubscriptions
    if (!_isEmpty(channels)) {
      await withAOUpdate(this, gid, (instance = {}) => {
        const { state = {} } = instance
        let { ws } = state

        channels.forEach(ch => {
          const cid = findChannelId(ws, (data) => {
            if (data.channel !== ch.channel) {
              return false
            }

            const fv = _pick(data, Object.keys(ch.filter))
            return _isEqual(ch.filter, fv)
          })

          if (!cid) {
            throw new Error('unknown channel ' + JSON.stringify(ch))
          }

          debug('unsubscribing from channel %s [AO gid %d]', cid, gid)

          ws = unsubscribeWS(ws, cid)
        })

        return {
          ...state,
          ws
        }
      })
    }

    return this.triggerAOEvent(instance, 'life', 'stop')
  }

  // Passes event to the AO instances that know the order
  async triggerOrderEvent (section, eventName, order) {
    const instances = Object.values(this.instances)

    await PI.forEach(instances, async (instance) => {
      const { state = {} } = instance
      const { orders = {}, allOrders = {}, cancelledOrders = {}, id, gid } = state
      const cids = Object.keys(allOrders)
      const cancelledCIds = Object.keys(cancelledOrders)
      const ocid = order.cid + ''

      // Note that we avoid triggering order_cancel for orders cancelled by us.
      // order_cancel is meant to trigger after a user UI interaction
      if (
        _includes(cids, ocid) && // tracked (known) order
        (
          eventName !== 'order_cancel' || // not a cancel
          !_includes(cancelledCIds, ocid) // or not canceled by us
        )
      ) {
        debug(
          'triggering order event %s:%s for AO %s [gid %s, o cid %s, %f @ %f %s]',
          section, eventName, id, gid, order.cid, order.amountOrig, order.price,
          order.status
        )

        if (orders[order.cid]) orders[order.cid] = order
        if (allOrders[order.cid]) allOrders[order.cid] = order
        if (cancelledOrders[order.cid]) cancelledOrders[order.cid] = order

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
    const ao = this.getAO(id)
    const sectionHandlers = (ao.events || {})[section]
    const handler = _get((sectionHandlers || {}), eventName)

    if (!_isFunction(handler)) {
      if (section === 'self') {
        debug('error: unknown handler %s:%s', section, eventName)
      }

      return
    }

    debug(
      'triggering %s:%s for AO %s [gid %s]',
      section, eventName, id, gid
    )

    await handler(instance, ...args)
  }
}
