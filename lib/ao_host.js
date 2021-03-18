'use strict'

const PI = require('p-iteration')
const _isFunction = require('lodash/isFunction')
const _isEmpty = require('lodash/isEmpty')
const _includes = require('lodash/includes')
const _get = require('lodash/get')
const debug = require('debug')('bfx:hf:algo:ao-host')

const WsAdapter = require('./ws_adapter')
const AsyncEventEmitter = require('./async_event_emitter')
const onMinimumSizeError = require('./host/events/minimum_size_error')
const onInsufficientBalanceError = require('./host/events/insufficient_balance')
const onSubmitAllOrders = require('./host/events/submit_all_orders')
const onCancelAllOrders = require('./host/events/cancel_all_orders')
const onUpdateState = require('./host/events/update_state')
const onAssignChannel = require('./host/events/assign_channel')
const onNotify = require('./host/events/notify')
const onStop = require('./host/events/stop')
const withAOUpdate = require('./host/with_ao_update')
const bindWS2Bus = require('./host/ws2/bind_bus')
const initAO = require('./host/init_ao')
const genHelpers = require('./host/gen_helpers')

/**
 * @typedef {object} EventMetaInformation
 * @property {object} chanFilter - source channel filter
 * @property {string} chanFilter.symbol - source channel symbol
 */

/**
 * @typedef {object} AOUIDefinition
 * @property {string} label - name of the order to be shown to the user
 * @property {string} id - internal algorithmic order ID
 * @property {string} [uiIcon] - CSS classname of the icon to show
 * @property {string} [customHelp] - documentation
 * @property {number} connectionTimeout - how long to wait before considering
 *   the HF disconnected
 * @property {number} actionTimeout - how long to wait for action confirmatio
 *   before considering the HF disconnected
 * @property {object} [header] - rendered at the top of the form
 * @property {string} [header.component] - component to use for the header
 * @property {string[]} [header.fields] - array of field names to render in
 *   header
 * @property {object[]} sections - the layout definition itself
 * @property {string} sections[].title - rendered above the section
 * @property {string} sections[].name - unique internal ID for the section
 * @property {string[][]} sections[].rows - array of rows of field IDs to
 *   render in the section, two per row.
 * @property {object} fields - field definitions, key'd by ID
 * @property {string[]} actions - array of action names, maximum 2
 */

/**
 * The AOHost class provides a wrapper around the algo order system, and
 * manages lifetime events/order execution. Internally it hosts a Manager
 * instance from bfx-api-node-core for communication with the Bitfinex API, and
 * listens for websocket stream events in order to update order state/trigger
 * algo order events.
 *
 * Execution is handled by an event system, with events being triggered by
 * Bitfinex API websocket stream payloads, and the algo orders themselves.
 *
 * To start/stop algo orders, `gid = startAO(id, args)` and `stopAO(gid)`
 * methods are provided, with the generated group ID (`gid`) being the same as
 * that used for all atomic orders created by the individual algo orders.
 */
class AOHost extends AsyncEventEmitter {
  /**
   * @param {object} [args] - arguments
   * @param {object} [args.db] - optional
   * @param {string} [args.wsURL] - wss://api.bitfinex.com/ws/2
   * @param {string} [args.restURL] - https://api.bitfinex.com
   * @param {object} [args.agent] - optional proxy agent
   * @param {object[]} [args.aos] - algo orders to manage
   * @param {number} [args.dms] - dead man switch, active 4 (default)
   */
  constructor (args = {}) {
    super()

    const { aos, wsSettings } = args

    this.aos = aos
    this.adapter = new WsAdapter(wsSettings)

    this.instances = {}

    this.ready = false

    this.onAOStart = this.onAOStart.bind(this)
    this.onAOStop = this.onAOStop.bind(this)
    this.onAOPersist = this.onAOPersist.bind(this)
    this.loadAO = this.loadAO.bind(this)
    this.triggerAOEvent = this.triggerAOEvent.bind(this)
    this.triggerGlobalEvent = this.triggerGlobalEvent.bind(this)
    this.triggerOrderEvent = this.triggerOrderEvent.bind(this)

    this.adapter.on('meta:error', this.onMetaError.bind(this))
    this.adapter.on('data:ticker', this.onDataTicker.bind(this))
    this.adapter.on('data:trades', this.onDataTrades.bind(this))
    this.adapter.on('data:candles', this.onDataCandles.bind(this))
    this.adapter.on('data:book', this.onDataBook.bind(this))
    this.adapter.on('data:managed:book', this.onDataManagedBook.bind(this))
    this.adapter.on('data:managed:candles', this.onDataManagedCandles.bind(this))
    this.adapter.on('data:notification', this.onDataNotification.bind(this))
    this.adapter.on('meta:reload', this.onMetaReload.bind(this))
    this.adapter.on('meta:connection:update', this.onMetaConnectionUpdate.bind(this))

    this.on('ao:start', this.onAOStart)
    this.on('ao:stop', this.onAOStop)
    this.on('ao:persist', this.onAOPersist)

    bindWS2Bus(this)

    this.adapter.on('order:snapshot', (snapshot) => {
      this.orderSnapshot = snapshot
    })

    this.adapter.once('order:snapshot', () => {
      this.ready = true
      this.emit('ready')
    })
  }

  /**
   * Get configured exchange adapter
   *
   * @returns {object} adapter
   */
  getAdapter () {
    return this.adapter
  }

  /**
   * Disconnect & reconnect the exchange adapter
   */
  reconnect () {
    this.adapter.reconnect()
  }

  /**
   * Close the exchange adapter connection.
   *
   * @returns {Promise} p - resolves on connection close
   */
  close () {
    return this.adapter.disconnect()
  }

  /**
   * @param {Error} error - error from incoming event
   * @private
   */
  onMetaError (error) {
    this.emit('error', error)
  }

  /**
   * Update internal connection when the adpater applies an update
   *
   * @param {number} i - connection ID
   * @param {object} c - new connection object
   * @private
   */
  onMetaConnectionUpdate (i, c) {
    Object.values(this.instances).forEach((instance = {}) => {
      const { connection } = instance.state
      const { id } = connection

      if (id === i) {
        connection.c = c
      }
    })
  }

  cleanState () {
    Object.values(this.instances).forEach((instance = {}) => {
      const { state = {} } = instance
      const { id, gid, interval = {}, timeout } = state

      state.ev.removeAllListeners()

      if (!_isEmpty(interval)) {
        clearInterval(interval)
        debug('cleared interval for %s [gid %s]', id, gid)
      }

      if (!_isEmpty(timeout)) {
        clearTimeout(timeout)
        debug('cleared timeout for %s [gid %s]', id, gid)
      }
    })

    this.instances = {}
  }

  onMetaReload () {
    this.cleanState()
    this.emit('meta:reload')
  }

  /**
   * Opens a new socket connection on the internal adapter
   */
  connect () {
    this.adapter.connect()
  }

  /**
   * Fetch configured algorithmic orders
   *
   * @returns {Array} aos
   */
  getAOs () {
    return Object.values(this.aos)
  }

  /**
   * Returns the algo order definition identified by the provided ID
   *
   * @param {string} id - i.e. bfx-iceberg
   * @returns {object} aoDef
   */
  getAO (id) {
    return Object.values(this.aos).find(ao => ao.id === id)
  }

  /**
   * Returns the active AO instance state identified by the provided GID
   *
   * @param {string} gid - algo order group ID
   * @returns {object} state - algo order state
   */
  getAOInstance (gid) {
    return this.instances[gid]
  }

  /**
   * Returns an array of all running algo order instances
   *
   * @returns {object[]} aoInstances
   */
  getAOInstances () {
    return Object.values(this.instances)
  }

  /**
   * Propagates notifications
   *
   * @param {object} notification - model
   * @param {object} meta - routing information
   * @private
   */
  onDataNotification (notification, meta = {}) {
    /**
     * Triggered when a notification is received.
     *
     * @event AOHost~dataNotification
     * @param {Array[]} notification - incoming notification data
     * @param {EventMetaInformation} meta - source channel information
     */
    this.triggerGlobalEvent('data', 'notification', notification, meta)
    this.emit('notification', notification)
  }

  /**
   * Propagates tickers
   *
   * @param {object} ticker - model
   * @param {object} meta - routing information
   * @private
   */
  onDataTicker (ticker, meta = {}) {
    /**
     * Triggered when a ticker is received.
     *
     * @event AOHost~dataTicker
     * @param {Array[]} ticker - incoming ticker data
     * @param {EventMetaInformation} meta - source channel information
     */
    this.triggerGlobalEvent('data', 'ticker', ticker, meta)
  }

  /**
   * Propagates trades
   *
   * @param {object[]} trades - models
   * @param {object} meta - routing information
   * @private
   */
  onDataTrades (trades, meta = {}) {
    /**
     * Triggered when a trade snapshot or single trade is received
     *
     * @event AOHost~dataTrades
     * @param {Array[]} update - incoming snapshot or single trade
     * @param {EventMetaInformation} meta - source channel information
     */
    this.triggerGlobalEvent('data', 'trades', trades, meta)
  }

  /**
   * Propagates candles
   *
   * @param {object[]} candles - models
   * @param {object} meta - routing information
   * @private
   */
  onDataCandles (candles, meta = {}) {
    /**
     * Triggered when a candle snapshot or individual candle is received.
     *
     * @event AOHost~dataCandles
     * @param {Array[]} update - incoming snapshot or single candle
     * @param {EventMetaInformation} meta - source channel information
     */
    this.triggerGlobalEvent('data', 'candles', candles, meta)
  }

  /**
   * Propagates order books
   *
   * @param {object} update - partial or full order book snapshot
   * @param {object} meta - routing information
   * @private
   */
  onDataBook (update, meta = {}) {
    /**
     * Triggered when an order book update is received.
     *
     * @event AOHost~dataBook
     * @param {Array[]} update - incoming snapshot or price level
     * @param {EventMetaInformation} meta - source channel information
     */
    this.triggerGlobalEvent('data', 'book', update, meta)
  }

  /**
   * Propagates full managed order books
   *
   * @param {object} book - full managed order book
   * @param {object} meta - routing information
   * @private
   * @fires AOHost~dataManagedBook
   */
  onDataManagedBook (book, meta = {}) {
    /**
     * Triggered when an order book update is received, and an internally
     * managed order book instance is updated. The entire order book is passed
     * to the event listeners.
     *
     * @event AOHost~dataManagedBook
     * @param {object} book - full order boook
     * @param {EventMetaInformation} meta - source channel information
     */
    this.triggerGlobalEvent('data', 'managedBook', book, meta)
  }

  /**
   * Propagates full candle sets
   *
   * @param {object[]} candles - full candle set
   * @param {object} meta - routing information
   * @private
   */
  onDataManagedCandles (candles, meta = {}) {
    /**
     * Triggered when a candle update is received, and an internally managed
     * candle dataset is updated. The entire dataset is passed to the event
     * listeners.
     *
     * @event AOHost~dataManagedCandles
     * @param {object[]} candles - full dataset
     * @param {EventMetaInformation} meta - source channel information
     */
    this.triggerGlobalEvent('data', 'managedCandles', candles, meta)
  }

  /**
   * Loads and starts a single algo order, with the provided serialized state
   *
   * @param {string} id - algo order definition ID
   * @param {string} gid - algo order instance group ID
   * @param {object} loadedState - algo order instance state
   * @returns {string} gid
   * @private
   */
  async loadAO (id, gid, loadedState = {}) {
    const ao = this.getAO(id)

    if (!ao) {
      throw new Error(`unknown algo order: ${id}`)
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

    const h = genHelpers(state, this.adapter)

    /**
     * @typedef {object} AOInstance
     * @property {object} state - instance state used during execution
     * @property {number} state.id - ID of the instance
     * @property {number} state.gid - ID of the order group, attached to all
     *   orders
     * @property {Array} state.channels - subscribed channels and their filters
     * @property {object} state.orders - map of open orders key'd by client ID
     * @property {object} state.cancelledOrders - map of cancelled orders key'd
     *   by client ID
     * @property {object} state.allOrders - map of all orders ever created by
     *   the instance key'd by client ID
     * @property {AsyncEventEmitter} state.ev - internal event emitter
     * @property {module:Helpers} h - helpers bound to the instance
     */
    const inst = { state, h }

    await this.bootstrapAO(ao, inst)
    return this.emit('ao:loaded', gid)
  }

  /**
   * Creates and starts a new algo order instance, based on the AO def
   * identified by the supplied ID
   *
   * @param {string} id - algo order definition ID, i.e. bfx-iceberg
   * @param {object} args - algo order arguments/parameters
   * @param {Function} [gidCB] - callback to acquire GID prior to ao:start
   * @returns {string} gid - instance GID
   */
  async startAO (id, args = {}, gidCB) {
    const ao = this.getAO(id)

    if (!ao) {
      throw new Error(`unknown algo order: ${id}`)
    }

    const inst = initAO(this.adapter, ao, args)

    return this.bootstrapAO(ao, inst, gidCB)
  }

  /**
   * Prepares the provided algo order instance for execution, saves it
   * internally for execution tracking, and starts it. Hooks up event listeners
   * and executes `declareEvents` and `declareChannels` on the instance. Emits
   * the 'ao:start' event.
   *
   * @param {object} ao - base algo order definition
   * @param {object} instance - new algo order to be started
   * @param {Function} [gidCB] - callback to acquire GID prior to ao:start
   * @returns {string} gid - new instance GID
   * @private
   */
  async bootstrapAO (ao, instance = {}, gidCB) {
    if (!this.ready) {
      throw new Error('ERR_NOT_READY')
    }

    const { state } = instance
    const { gid } = state

    state.connection = this.adapter.getConnection()

    this.instances[gid] = instance

    state.ev.on('channel:assign', onAssignChannel.bind(null, this))
    state.ev.on('state:update', onUpdateState.bind(null, this))
    state.ev.on('notify', onNotify.bind(null, this))
    state.ev.on('error:minimum_size', onMinimumSizeError.bind(null, this))
    state.ev.on('error:insufficient_balance', onInsufficientBalanceError.bind(null, this))
    state.ev.on('exec:order:submit:all', onSubmitAllOrders.bind(null, this))
    state.ev.on('exec:order:cancel:all', onCancelAllOrders.bind(null, this))
    state.ev.on('exec:stop', onStop.bind(null, this, gid))

    const { declareEvents, declareChannels } = ao.meta || {}

    if (_isFunction(declareEvents)) {
      await declareEvents(this.instances[gid], this)
    }

    if (_isFunction(declareChannels)) {
      await declareChannels(this.instances[gid], this)
    }

    await this.maybeCancelExistingOrders(state, gid)

    if (_isFunction(gidCB)) {
      await gidCB(gid)
    }

    await this.emit('ao:start', this.instances[gid])

    return gid
  }

  async maybeCancelExistingOrders (state, gid) {
    const snapshot = this.orderSnapshot

    if (snapshot.gid && snapshot.gid === +gid) {
      await this.adapter.cancelOrderWithDelay(
        state.connection, 0, snapshot
      )
      return
    }

    // snapshot is an array-like-object
    for (let i = 0; i < snapshot.length; i += 1) {
      const el = snapshot[i]

      if (el.gid === +gid) {
        await this.adapter.cancelOrderWithDelay(
          state.connection, 0, el
        )
      }
    }
  }

  /**
   * Stops an algo order instance by GID
   *
   * @param {string} gid - algo order instance GID
   */
  async stopAO (gid) {
    const instance = this.instances[gid]

    if (!instance) {
      throw new Error(`unknown AO: ${gid}`)
    }

    await this.emit('ao:stop', instance)
  }

  /**
   * Triggers a 'self' event on an algo order instance with the provided
   * arguments
   *
   * @param {object} instance - algo order instance to operate on
   * @param {string} eventName - name of event to trigger
   * @param {...any} args - event arguments
   * @returns {Promise} p - resolves when all handlers complete
   * @private
   */
  onAOSelfEvent (instance, eventName, ...args) {
    return this.triggerAOEvent(instance, 'self', eventName, ...args)
  }

  /**
   * @returns {boolean} aosRunning - true if any algo order is currently running
   */
  aosRunning () {
    return Object.values(this.instances).find((instance) => {
      const { state } = instance
      const { active } = state
      return active
    })
  }

  /**
   * Handles init for an algo order instance; sets the 'active' flag, subscribes
   * to required channels, and triggers the life.start event.
   *
   * @param {object} instance - algo order instance that has started
   * @private
   */
  async onAOStart (instance = {}) {
    const { channels = [], gid, connection } = instance.state

    await withAOUpdate(this, gid, (instance = {}) => {
      const { state = {} } = instance

      return {
        ...state,
        active: true
      }
    })

    if (!_isEmpty(channels)) {
      channels.forEach(ch => {
        debug('subscribing to channel %j [AO gid %d]', ch, gid)

        this.adapter.subscribe(connection, ch.channel, ch.filter)
      })
    }

    /**
     * Triggered when an algorithmic order begins execution.
     *
     * @event AOHost~lifeStart
     */
    await this.triggerAOEvent(instance, 'life', 'start')
    await this.emit('ao:persist', gid)
  }

  /**
   * Handles algo order teardown; disables the 'active' state flag, unsubscribes
   * from channels, emits the life.stop event, and saves the AO instance.
   *
   * @param {object} instance - algo order instance to operate on
   * @private
   */
  async onAOStop (instance = {}) {
    const { h } = instance
    const { channels = [], gid, connection } = instance.state

    h.clearAllTimeouts()

    await withAOUpdate(this, gid, (instance = {}) => {
      const { state = {} } = instance

      return {
        ...state,
        active: false
      }
    })

    if (!_isEmpty(channels)) {
      channels.forEach(ch => {
        debug('unsubscribing from channel %s [AO gid %d]', ch.channel, gid)
        this.adapter.unsubscribe(connection, ch.channel, ch.filter)
      })
    }

    /**
     * Triggered when an algorithmic order ends execution.
     *
     * @event AOHost~lifeStop
     */
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

    if (!instance) {
      return
    }

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

    await this.emit('ao:persist:db:update', {
      gid,
      algoID: id,
      state: JSON.stringify(serialize(state)),
      active: state.active
    })

    debug('saved AO %s', gid)
  }

  /**
   * Passes event to the AO instances that know the order
   *
   * @param {string} section - name of section to trigger event on
   * @param {string} eventName - name of event to trigger
   * @param {object} order - order instance to pass to event handler
   * @private
   */
  async triggerOrderEvent (section, eventName, order) {
    if (!this.adapter.orderEventsValid()) {
      return
    }

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
          (eventName !== 'order_cancel' && eventName !== 'order_error') ||
          !_includes(cancelledCIds, ocid) // or not canceled by us
        )
      ) {
        debug(
          'triggering order event %s:%s for AO %s [gid %s, o cid %s, %f @ %f %s]',
          section, eventName, id, gid, order.cid, order.amountOrig, order.price,
          order.status
        )

        if (orders[ocid]) {
          orders[ocid].updateFrom(order)
        }

        if (allOrders[ocid]) {
          allOrders[ocid].updateFrom(order)
        }

        if (cancelledOrders[ocid]) {
          cancelledOrders[ocid].updateFrom(order)
        }

        await this.triggerAOEvent(
          instance,
          section,
          eventName,
          allOrders[ocid]
        )
      }
    })
  }

  /**
   * Triggers an event with the supplied arguments on all active algo order
   * instances.
   *
   * @param {string} section - name of section to trigger event on
   * @param {string} eventName - name of event to trigger
   * @param  {...any} args - event arguments
   * @returns {Promise} p - resolves when all handlers complete
   * @private
   */
  async triggerGlobalEvent (section, eventName, ...args) {
    const instances = Object.values(this.instances)

    return PI.forEach(instances, async (instance) => (
      this.triggerAOEvent(instance, section, eventName, ...args)
    ))
  }

  /**
   * Triggers an event on an algo order instance
   *
   * @param {object} instance - algo order instance to operate on
   * @param {string} section - name of section to trigger event on
   * @param {string} eventName - name of event to trigger
   * @param  {...any} args - event arguments
   * @returns {Promise} p - resolves when all handlers complete
   * @private
   */
  async triggerAOEvent (instance, section, eventName, ...args) {
    const { state } = instance
    const { id, gid, ev } = state
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

    return ev.emit(`internal:${section}:${eventName}`, ...args)
  }
}

/**
 * How long orders are allowed to settle for before teardown in ms.
 *
 * @type {number}
 * @default 10000
 */
AOHost.TEARDOWN_GRACE_PERIOD_MS = 1 * 1000

module.exports = AOHost
