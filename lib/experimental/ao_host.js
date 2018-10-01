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
  subscribe, unsubscribe, findChannelId
} = require('bfx-api-node-core')
const { AlgoOrder } = require('bfx-hf-models')

const ManagedOB = require('bfx-api-node-plugin-managed-ob')
const ManagedCandles = require('bfx-api-node-plugin-managed-candles')

const AsyncEventEmitter = require('./async_event_emitter')
const onSubmitAllOrders = require('./host/events/submit_all_orders')
const onCancelAllOrders = require('./host/events/cancel_all_orders')
const onUpdateState = require('./host/events/update_state')
const onAssignChannel = require('./host/events/assign_channel')
const onNotify = require('./host/events/notify')
const withAOUpdate = require('./host/with_ao_update')
const bindWS2Bus = require('./host/ws2/bind_bus')
const initAO = require('./host/init_ao')
const genHelpers = require('./host/gen_helpers')
const registerAOUIs = require('./host/ui/register_ao_uis')

module.exports = class AOHost extends AsyncEventEmitter {
  constructor (args = {}) {
    super()

    const { apiKey, apiSecret, agent, wsURL, restURL, aos } = args

    this.aos = aos
    this.instances = {}
    this.onAOStart = this.onAOStart.bind(this)
    this.onAOStop = this.onAOStop.bind(this)
    this.onAOPersist = this.onAOPersist.bind(this)
    this.triggerAOEvent = this.triggerAOEvent.bind(this)
    this.triggerGlobalEvent = this.triggerGlobalEvent.bind(this)
    this.triggerOrderEvent = this.triggerOrderEvent.bind(this)
    this.onWSNotification = this.onWSNotification.bind(this)
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
      dms: 4,
      apiSecret,
      apiKey,
      agent,
      wsURL,
      restURL
    })

    // NOTE: Auto-open/auth
    this.m.on('ws2:ticker', this.onWSTicker)
    this.m.on('ws2:trades', this.onWSTrades)
    this.m.on('ws2:candles', this.onWSCandles)
    this.m.on('ws2:book', this.onWSBook)
    this.m.on('ws2:managed:book', this.onWSManagedBook)
    this.m.on('ws2:managed:candles', this.onWSManagedCandles)
    this.m.on('ws2:notification', this.onWSNotification)
    this.m.on('socket:updated', this.onSocketUpdate)

    this.on('ao:start', this.onAOStart)
    this.on('ao:stop', this.onAOStop)
    this.on('ao:persist', this.onAOPersist)

    bindWS2Bus(this)
    registerAOUIs(this)

    this.once('ws2:auth:success', () => {
      this.loadAllAOs().then(() => {
        debug('loaded all known algorithmic orders')
      }).catch((err) => {
        debug('error loading algo orders: %s', err)
      })
    })
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

  getAOInstance (gid) {
    return this.instances[gid]
  }

  onWSNotification (notification, meta = {}) {
    this.triggerGlobalEvent('data', 'notification', notification, meta)
    this.emit('ws2:notification', notification)
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

  async loadAllAOs () {
    const aos = await AlgoOrder.find({ active: true }).exec()
    let ao

    for (let i = 0; i < aos.length; i += 1) {
      ao = aos[i]
      await this.loadAO(ao.algoID, ao.gid, ao.state)
    }
  }

  async loadAO (id, gid, loadedState = {}) {
    const ao = this.getAO(id)

    if (!ao) {
      throw new Error('unknown algo order: %s', id)
    }

    const { meta = {} } = ao
    const { unserialize } = meta

    const state = _isFunction(unserialize)
      ? unserialize(loadedState)
      : { ...loadedState }

    state.id = id
    state.gid = gid
    state.channels = []
    state.orders = {}
    state.cancelledOrders = {}
    state.allOrders = {}
    state.ev = new AsyncEventEmitter()
 
    const h = genHelpers(state)
    const inst = { state, h }
   
    return this.bootstrapAO(ao, inst)
  }

  async startAO (id, args = {}) {
    const ao = this.getAO(id)

    if (!ao) {
      throw new Error('unknown algo order: %s', id)
    }

    const inst = initAO(ao, args)

    return this.bootstrapAO(ao, inst)
  }

  async bootstrapAO (ao, inst = {}) {
    const { state } = inst
    const { gid } = state
    const wsi = this.m.sampleWSI()

    state.ws = this.m.getWSByIndex(wsi)
    state.wsi = wsi

    this.instances[gid] = inst

    state.ev.on('channel:assign', onAssignChannel.bind(null, this))
    state.ev.on('state:update', onUpdateState.bind(null, this))
    state.ev.on('notify', onNotify.bind(null, this))
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

    await withAOUpdate(this, gid, (instance = {}) => {
      const { state = {} } = instance

      return {
        ...state,
        active: true
      }
    })

    // TODO: Extract, channel subscriptions
    if (!_isEmpty(channels)) {
      await withAOUpdate(this, gid, (instance = {}) => {
        const { state = {} } = instance
        let { ws } = state

        channels.forEach(ch => {
          debug('subscribing to channel %j [AO gid %d]', ch, gid)

          ws = subscribe(ws, ch.channel, ch.filter)
        })

        return {
          ...state,
          ws
        }
      })
    }

    await this.triggerAOEvent(instance, 'life', 'start')
  }

  async onAOStop (instance = {}) {
    const { channels = [], gid, id } = instance.state

    await withAOUpdate(this, gid, (instance = {}) => {
      const { state = {} } = instance

      return {
        ...state,
        active: false
      }
    })

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

          ws = unsubscribe(ws, cid)
        })

        return {
          ...state,
          ws
        }
      })
    }

    await this.triggerAOEvent(instance, 'life', 'stop')
    await this.emit('ao:persist', gid)
  }

  async onAOPersist (gid) {
    const instance = this.instances[gid]
    const { state = {} } = instance
    const { id } = state
    const ao = this.getAO(id)

    if (!ao) {
      throw new Error(`can\t persist unknown ao: ${id}`)
    }

    const { meta = {} } = ao
    const { serialize } = meta

    if (!serialize) {
      debug('can\t save AO %s [%s] due to missing serialize method', gid, id)
      return
    }

    return new Promise((resolve, reject) => {
      AlgoOrder.update({ algoID: id, gid }, {
        state: serialize(state),
        active: state.active,
      }, { upsert: true }, (err, res) => {
        if (err) {
          reject(err)
        } else {
          debug('saved AO %s', gid)
          resolve(res)
        }
      })
    })
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
