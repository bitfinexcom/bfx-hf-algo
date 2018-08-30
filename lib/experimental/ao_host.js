'use strict'

const PI = require('p-iteration')
const { Manager } = require('bfx-api-node-core')
const { nonce } = require('bfx-api-node-util')
const _isFunction = require('lodash/isFunction')
const _isEmpty = require('lodash/isEmpty')
const _isEqual = require('lodash/isEqual')
const _includes = require('lodash/includes')
const _get = require('lodash/get')
const _pick = require('lodash/pick')
const debug = require('debug')('bfx:hf:algo:ao-host')
const {
  cancelOrderWithDelay, submitOrderWithDelay, subscribeWS, unsubscribeWS,
  findChannelId
} = require('bfx-api-node-core')

const AsyncEventEmitter = require('./async_event_emitter')
const genHelpers = require('./host/gen_helpers')
const onSubmitAllOrders = require('./host/events/submit_all_orders')
const onCancelAllOrders = require('./host/events/cancel_all_orders')
const onUpdateState = require('./host/events/update_state')
const onAssignChannel = require('./host/events/assign_channel')
const onSubscribeChannel = require('./host/events/subscribe_channel')
const onUnsubscribeChannel = require('./host/events/unsubscribe_channel')
const withAOUpdate = require('./host/with_ao_update')

const bindWS2Bus = require('./host/ws2/bind_bus')

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

    this.m = new Manager({
      transform: true,
      apiSecret,
      apiKey,
      agent,
      wsURL,
      restURL,
    })

    // NOTE: Auto-open/auth
    this.m.once('ws2:open', () => { this.m.auth({ dms: 4 }) })
    this.m.once('ws2:ticker', this.onWSTicker)
    this.m.once('ws2:trades', this.onWSTrades)
    this.m.once('ws2:candles', this.onWSCandles)
    this.m.once('ws2:book', this.onWSBook)

    this.on('ao:start', this.onAOStart)
    this.on('ao:stop', this.onAOStop)

    bindWS2Bus(this)
  }

  connect () {
    this.m.openWS()
  }

  getAO (id) {
    return Object.values(this.aos).find(ao => ao.id === id)
  }

  onWSTicker (ticker, meta = {}) {
    const { chanFilter } = meta
    this.triggerGlobalEvent('data', 'ticker', ticker, chanFilter)
  }

  onWSTrades (trades, meta = {}) {
    const { chanFilter } = meta
    this.triggerGlobalEvent('data', 'trades', trades, chanFilter)
  }

  onWSCandles (candles, meta = {}) {
    const { chanFilter } = meta
    this.triggerGlobalEvent('data', 'candles', candles, chanFilter)
  }

  onWSBook (update, meta = {}) {
    const { chanFilter } = meta
    this.triggerGlobalEvent('data', 'book', update, chanFilter)
  }

  async startAO (id, args = {}) {
    const ao = this.getAO(id)

    if (!ao) {
      throw new Error('unknown algo order: %s', id)
    }

    const {
      validateParams, processParams, initState, declareEvents, declareChannels
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

    const gid = nonce() + ''
    const state = {
      channels: [],
      orders: {},          // active
      cancelledOrders: {}, // cancelled by us (not via UI)
      allOrders: {},       // active + closed
      ws: this.m.sampleWS(),
      id: id,
      gid: gid,
      ev: new AsyncEventEmitter(),

      ...initialState
    }

    const h = genHelpers(state)
    this.instances[gid] = { state, h }

    // TODO: Remove handlers
    // state.ev.on('channel:subscribe', onSubscribeChannel.bind(null, this))
    // state.ev.on('channel:unsubscribe', onUnsubscribeChannel.bind(null, this))

    state.ev.on('channel:assign', onAssignChannel.bind(null, this))
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

    if (_isFunction(declareChannels)) {
      await declareChannels(this.instances[gid], this)
    }

    await this.emit('ao:start', this.instances[gid])
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
            return _isEqual(data, fv)
          })

          if (!cid) {
            throw new Error('unknown channel %j', ch)
          }

          debug('unsubscribing from channel %j [AO gid %d]', ch, gid)

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
      const { allOrders = {}, cancelledOrders = {}, id, gid } = state
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
