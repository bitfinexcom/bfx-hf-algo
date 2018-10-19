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
const onMinimumSizeError = require('./host/events/minimum_size_error')
const onInsufficientBalanceError = require('./host/events/insufficient_balance')
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

/**
 * The AOHost class provides a wrapper around the algo order system, and
 * manages lifetime events/order execution. Internally it hosts a Manager
 * instance from bfx-api-node-core for communication with the Bitfinex API, and
 * listens for websocket stream events in order to update order state/trigger
 * algo order events.
 *
 * Execution is handled by an event system, with events being triggered by
 * Bitfinex API websocket stream payloads, and the algo orders themselves.
 */
class AOHost extends AsyncEventEmitter {
  /**
   * @param {Object} args
   * @param {string} args.apiKey
   * @param {string} args.apiSecret
   * @param {string?} args.wsURL - wss://api.bitfinex.com/ws/2
   * @param {string?} args.restURL - https://api.bitfinex.com
   * @param {Object?} args.agent - optional proxy agent
   * @param {Object[]} args.aos - algo orders to manage
   */
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

  /**
   * Update internal socket state when the manager applies an update
   *
   * @param {number} i - websocket ID/index
   * @param {Object} state - new socket state
   * @private
   */
  onSocketUpdate (i, state) {
    Object.values(this.instances).forEach((instance = {}) => {
      const { wsi } = instance.state

      if (wsi === i) {
        instance.state.ws = state
      }
    })
  }

  /**
   * Opens a new socket connection on the internal socket manager
   */
  connect () {
    this.m.openWS()
  }

  /**
   * Returns the algo order definition identified by the provided ID
   *
   * @param {string} id - i.e. bfx.iceberg
   * @return {Object} aoDef
   */
  getAO (id) {
    return Object.values(this.aos).find(ao => ao.id === id)
  }

  /**
   * Returns the active AO instance state identified by the provided GID
   *
   * @param {string} gid - algo order group ID
   * @return {Object} state - algo order state
   */
  getAOInstance (gid) {
    return this.instances[gid]
  }

  /**
   * Propagates websocket notifications
   *
   * @param {Notification} notification - model
   * @param {Object} meta - routing information
   * @private
   */
  onWSNotification (notification, meta = {}) {
    this.triggerGlobalEvent('data', 'notification', notification, meta)
    this.emit('ws2:notification', notification)
  }

  /**
   * Propagates websocket tickers
   *
   * @param {TradingTicker|FundingTicker} ticker - model
   * @param {Object} meta - routing information
   * @private
   */
  onWSTicker (ticker, meta = {}) {
    this.triggerGlobalEvent('data', 'ticker', ticker, meta)
  }

  /**
   * Propagates websocket trades
   *
   * @param {PublicTrade[]} trades - models
   * @param {Object} meta - routing information
   * @private
   */
  onWSTrades (trades, meta = {}) {
    this.triggerGlobalEvent('data', 'trades', trades, meta)
  }

  /**
   * Propagates websocket candles
   *
   * @param {Candle[]} candles - models
   * @param {Object} meta - routing information
   * @private
   */
  onWSCandles (candles, meta = {}) {
    this.triggerGlobalEvent('data', 'candles', candles, meta)
  }

  /**
   * Propagates websocket order books
   *
   * @param {OrderBook} update - partial or full order book snapshot
   * @param {Object} meta - routing information
   * @private
   */
  onWSBook (update, meta = {}) {
    this.triggerGlobalEvent('data', 'book', update, meta)
  }

  /**
   * Propagates full managed order books as maintained by the API plugin
   * bfx-api-node-plugin-managed-ob
   *
   * @param {OrderBook} book - full managed order book
   * @param {Object} meta - routing information
   * @private
   */
  onWSManagedBook (book, meta = {}) {
    this.triggerGlobalEvent('data', 'managedBook', book, meta)
  }

  /**
   * Propagates full candle sets as maintained by the API plugin
   * bfx-api-node-plugin-managed-candles
   *
   * @param {Candle[]} candles - full candle set
   * @param {Object} meta - routing information
   * @private
   */
  onWSManagedCandles (candles, meta = {}) {
    this.triggerGlobalEvent('data', 'managedCandles', candles, meta)
  }

  /**
   * Loads and starts all saved previously active algo orders
   */
  async loadAllAOs () {
    const aos = await AlgoOrder.find({ active: true }).exec()
    let ao

    for (let i = 0; i < aos.length; i += 1) {
      ao = aos[i]
      await this.loadAO(ao.algoID, ao.gid, ao.state)
    }
  }

  /**
   * Loads and starts a single algo order, with the provided serialized state
   *
   * @param {string} id - algo order definition ID
   * @param {string} gid - algo order instance group ID
   * @param {Object} loadedState - algo order instance state
   * @return {string} gid
   */
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

  /**
   * Creates and starts a new algo order instance, based on the AO def
   * identified by the supplied ID
   *
   * @param {string} id - algo order definition ID, i.e. bfx.iceberg
   * @param {Object} args - algo order arguments/parameters
   * @return {string} gid - instance GID
   */
  async startAO (id, args = {}) {
    const ao = this.getAO(id)

    if (!ao) {
      throw new Error('unknown algo order: %s', id)
    }

    const inst = initAO(ao, args)

    return this.bootstrapAO(ao, inst)
  }

  /**
   * Prepares the provided algo order instance for execution, saves it
   * internally for execution tracking, and starts it. Hooks up event listeners
   * and executes `declareEvents` and `declareChannels` on the instance. Emits
   * the 'ao:start' event.
   *
   * @param {Object} ao - base algo order definition
   * @param {Object} instance - new algo order to be started
   * @return {string} gid - new instance GID
   * @private
   */
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
    state.ev.on('error:minimum_size', onMinimumSizeError.bind(null, this))
    state.ev.on('error:insufficient_balance', onInsufficientBalanceError.bind(null, this))
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

  /**
   * Stops an algo order instance by GID
   *
   * @param {string} gid - algo order instance GID
   */
  async stopAO (gid) {
    const instance = this.instances[gid]

    if (!instance) {
      throw new Error('unknown AO: %s', gid)
    }

    await this.emit('ao:stop', instance)
  }

  /**
   * Triggers a 'self' event on an algo order instance with the provided
   * arguments
   *
   * @param {Object} instance - algo order instance to operate on
   * @param {string} eventName
   * @param  {...any} args - event arguments
   * @private
   */
  onAOSelfEvent (instance, eventName, ...args) {
    return this.triggerAOEvent(instance, 'self', eventName, ...args)
  }

  /**
   * Handles init for an algo order instance; sets the 'active' flag, subscribes
   * to required channels, and triggers the life.start event.
   *
   * @param {Object} instance - algo order instance that has started
   * @private
   */
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

  /**
   * Handles algo order teardown; disables the 'active' state flag, unsubscribes
   * from channels, emits the life.stop event, and saves the AO instance.
   *
   * @param {Object} instance - algo order instance to operate on
   * @private
   */
  async onAOStop (instance = {}) {
    const { channels = [], gid } = instance.state

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

  /**
   * Serializes & saves an algo order instance state to the DB
   *
   * @param {string} gid - GID of algo order instance to persist
   * @private
   */
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
        active: state.active
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

  /**
   * Passes event to the AO instances that know the order
   *
   * @param {string} section - name of section to trigger event on
   * @param {string} eventName
   * @param {Order} order - order instance to pass to event handler
   * @private
   */
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

        if (orders[order.cid]) {
          orders[order.cid].updateFrom(order)
        }

        if (allOrders[order.cid]) {
          allOrders[order.cid].updateFrom(order)
        }

        if (cancelledOrders[order.cid]) {
          cancelledOrders[order.cid].updateFrom(order)
        }

        await this.triggerAOEvent(
          instance,
          section,
          eventName,
          allOrders[order.cid]
        )
      } else {
        debug(
          'unknown order cid %s, %f @ %f %s',
          order.cid, order.amountOrig, order.price, order.status
        )
      }
    })
  }

  /**
   * Triggers an event with the supplied arguments on all active algo order
   * instances.
   *
   * @param {string} section - name of section to trigger event on
   * @param {string} eventName
   * @param  {...any} args - event arguments
   * @private
   */
  async triggerGlobalEvent (section, eventName, ...args) {
    const instances = Object.values(this.instances)

    await PI.forEach(instances, async (instance) => (
      this.triggerAOEvent(instance, section, eventName, ...args)
    ))
  }

  /**
   * Triggers an event on an algo order instance
   *
   * @param {Object} instance - algo order instance to operate on
   * @param {string} section - name of section to trigger event on
   * @param {string} eventName
   * @param  {...any} args - event arguments
   * @private
   */
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

module.exports = AOHost
