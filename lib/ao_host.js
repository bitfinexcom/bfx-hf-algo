'use strict'

const _isString = require('lodash/isString')
const _isObject = require('lodash/isObject')
const _isFunction = require('lodash/isFunction')
const _isEmpty = require('lodash/isEmpty')
const _includes = require('lodash/includes')
const _get = require('lodash/get')
const debug = require('debug')('bfx:hf:algo:ao-host')

const WsAdapter = require('./ws_adapter')
const { RESTv2 } = require('bfx-api-node-rest')
const AsyncEventEmitter = require('./async_event_emitter')
const onUnknownError = require('./host/events/unknown_error')
const onMinimumSizeError = require('./host/events/minimum_size_error')
const onEvaluateBalanceError = require('./host/events/evaluate_balance_error')
const onInsufficientBalanceError = require('./host/events/insufficient_balance')
const onLogAlgoData = require('./host/events/log_algo_data')
const onSubmitAllOrders = require('./host/events/submit_all_orders')
const onCancelAllOrders = require('./host/events/cancel_all_orders')
const onCancelOrdersByGid = require('./host/events/cancel_orders_by_gid')
const onUpdateState = require('./host/events/update_state')
const onAssignChannel = require('./host/events/assign_channel')
const onNotify = require('./host/events/notify')
const onStop = require('./host/events/stop')
const bindWS2Bus = require('./host/ws2/bind_bus')
const initAO = require('./host/init_ao')
const initAOState = require('./host/init_ao_state')

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
   * @param {object[]} [args.aos] - algo orders to manage
   * @param {object} [args.logAlgoOpts] - logging options for algo orders
   * @param {boolean} [args.logAlgoOpts.logAlgo] - option to enable/disable logging
   * @param {string} [args.logAlgoOpts.logAlgoDir] - directory for logs to be saved
   * @param {object} [args.wsSettings] - web socket settings
   * @param {string} [args.wsSettings.apiKey] - api key
   * @param {string} [args.wsSettings.apiSecret] - api secret
   * @param {string} [args.wsSettings.restURL] - https://api.bitfinex.com
   * @param {string} [args.wsSettings.wsURL] - wss://api.bitfinex.com/ws/2
   * @param {number} [args.wsSettings.dms] - dead man switch, active 4 (default)
   * @param {string} [args.wsSettings.affiliateCode] - user's affiliate code
   * @param {boolean} [args.wsSettings.withHeartbeat] - option to enable/disable heartbeat
   * @param {boolean} [args.signalTracerOpts.enabled]
   * @param {string} [args.signalTracerOpts.dir]
   */
  constructor (args = {}) {
    super()

    const {
      aos,
      logAlgoOpts,
      wsSettings,
      signalTracerOpts = { enabled: false, dir: '' }
    } = args

    this.aos = aos
    this.logAlgoOpts = logAlgoOpts
    this.config = { signalTracerOpts }
    this.adapter = new WsAdapter(wsSettings)

    const { restURL } = wsSettings
    this.rest = new RESTv2({ url: restURL })

    this.instances = {}

    this.ready = false

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
    this.adapter.disconnect()
    return this._closeSignalTracers()
  }

  /**
   * @returns {Promise<[]>}
   * @private
   */
  _closeSignalTracers () {
    return Promise.all(
      this.getAOInstances()
        .map(({ h: { tracer } }) => tracer.close())
    )
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
    this.getAOInstances().forEach((instance = {}) => {
      const { connection } = instance.state
      const { id } = connection

      if (id === i) {
        connection.c = c
      }
    })
  }

  cleanState () {
    this.getAOInstances().forEach((instance = {}) => {
      const { state = {} } = instance
      const { id, gid, timeout } = state

      state.ev.removeAllListeners()

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

  async getPairConfig (symbol) {
    const pairConfig = await this.rest.conf([
      'pub:info:pair',
      'pub:info:pair:futures'
    ])

    const [pairInfo = [], futurePairInfo = []] = pairConfig || []
    const mergedPairConfig = pairInfo.concat(futurePairInfo)

    const matchedPairConfig = mergedPairConfig.find(conf => `t${conf[0]}` === symbol)

    if (!matchedPairConfig) return {}

    const [, [, , , minSize, maxSize]] = matchedPairConfig

    return {
      minSize: +minSize,
      maxSize: +maxSize
    }
  }

  /**
   * Opens a new socket connection on the internal adapter
   * @returns {Promise}
   */
  connect () {
    return new Promise((resolve, reject) => {
      this.adapter.once('auth:success', resolve)
      this.adapter.once('auth:error', reject)
      this.adapter.connect()
    })
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
   * @param {number} createdAt - creation timestamp of algo order
   * @returns {string} gid
   * @private
   */
  async loadAO (id, gid, loadedState = {}, createdAt) {
    const ao = this.getAO(id)

    if (!ao) {
      throw new Error(`unknown algo order: ${id}`)
    }

    const { meta = {}, headersForLogFile } = ao
    const { unserialize } = meta

    const state = _isFunction(unserialize)
      ? unserialize(loadedState)
      : { ...loadedState }

    const { args: { symbol } } = state
    const pairConfig = await this.getPairConfig(symbol)

    state.id = id
    state.gid = gid
    state.createdAt = createdAt
    state.pairConfig = pairConfig
    state.headersForLogFile = headersForLogFile
    state.channels = []
    state.orders = {}
    state.cancelledOrders = {}
    state.allOrders = {}
    state.ev = new AsyncEventEmitter()

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
    const inst = initAO(this.adapter, state, this.config)
    return this.bootstrapAO(ao, inst)
  }

  /**
   * Creates and starts a new algo order instance, based on the AO def
   * identified by the supplied ID
   *
   * @param {string} id - algo order definition ID, i.e. bfx-iceberg
   * @param {object} args - algo order arguments/parameters
   */
  async startAO (id, args = {}) {
    const ao = this.getAO(id)

    if (!ao) {
      throw new Error(`unknown algo order: ${id}`)
    }

    const { _symbol } = args
    const pairConfig = await this.getPairConfig(_symbol)

    const state = initAOState(ao, args, pairConfig)
    const inst = initAO(this.adapter, state, this.config)

    return this.bootstrapAO(ao, inst)
  }

  /**
   * Prepares the provided algo order instance for execution, saves it
   * internally for execution tracking, and starts it. Hooks up event listeners
   * and executes `declareEvents` and `declareChannels` on the instance. Emits
   * the 'ao:start' event.
   *
   * @param {object} ao - base algo order definition
   * @param {object} instance - new algo order to be started
   * @private
   */
  async bootstrapAO (ao, instance = {}) {
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
    state.ev.on('error:evaluate_balance', onEvaluateBalanceError.bind(null, this))
    state.ev.on('error:unknown_error', onUnknownError.bind(null, this))
    state.ev.on('error:insufficient_balance', onInsufficientBalanceError.bind(null, this))
    state.ev.on('exec:order:submit:all', onSubmitAllOrders.bind(null, this))
    state.ev.on('exec:order:cancel:all', onCancelAllOrders.bind(null, this))
    state.ev.on('exec:order:cancel:gid', onCancelOrdersByGid.bind(null, this))
    state.ev.on('exec:stop', onStop.bind(null, this, gid))
    state.ev.on('exec:log_algo_data', onLogAlgoData.bind(null, this))

    const { declareEvents, declareChannels } = ao.meta || {}

    if (_isFunction(declareEvents)) {
      await declareEvents(instance, this)
    }

    if (_isFunction(declareChannels)) {
      await declareChannels(instance, this)
    }

    await this.maybeCancelExistingOrders(state, gid)

    return this._startAlgo(instance)
  }

  async maybeCancelExistingOrders (state, gid) {
    const snapshot = this.orderSnapshot

    if (snapshot.gid && snapshot.gid === +gid) {
      await this.adapter.cancelOrder(
        state.connection, snapshot
      )
      return
    }

    // snapshot is an array-like-object
    for (let i = 0; i < snapshot.length; i += 1) {
      const el = snapshot[i]

      if (el.gid === +gid) {
        await this.adapter.cancelOrder(
          state.connection, el
        )
      }
    }
  }

  getSerializedAlgos () {
    return this.getAOInstances().map((instance) => {
      return this.getSerializedAO(instance)
    })
  }

  /**
   * Stops an algo order instance by GID
   *
   * @param {string} gid - algo order instance GID
   * @returns {Promise<void>}
   */
  async stopAO (gid) {
    const instance = this.instances[gid]

    if (!instance) {
      throw new Error(`unknown AO: ${gid}`)
    }

    return this._stopAlgo(instance)
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
    return this.getAOInstances()
      .some((instance) => {
        const { state } = instance
        const { active } = state
        return active
      })
  }

  /**
   * Handles init for an algo order instance; sets the 'active' flag, subscribes
   * to required channels, and triggers the life.start event.
   *
   * @param {AoInstance} instance - algo order instance that has started
   */
  async _startAlgo (instance = {}) {
    const { state } = instance
    const { id, gid, name, label, args, i18n, createdAt } = state
    let { alias } = state
    delete args.alias

    state.active = true

    if (!alias) {
      alias = _isString(label) ? label : (_isObject(label) && label.origin) ? label.origin : alias
      instance.state.alias = alias
    }

    /**
     * Triggered when an algorithmic order begins execution.
     *
     * @event AOHost~lifeStart
     */
    await this.triggerAOEvent(instance, 'life', 'start')
    await this.emit('ao:persist', gid)

    return [
      this.getSerializedAO(instance),
      { id, gid, alias, name, label, args, i18n, createdAt }
    ]
  }

  /**
   * Handles algo order teardown; disables the 'active' state flag, unsubscribes
   * from channels, emits the life.stop event, and saves the AO instance.
   *
   * @param {AoInstance} instance - algo order instance to operate on
   * @param {object} opts - options if required for algo order
   * @private
   */
  async _stopAlgo (instance = {}, opts = {}) {
    const { h, state } = instance
    const {
      id, channels = [], gid, connection, ev, algoLogWriter,
      name, label, args
    } = state

    h.close()

    state.active = false

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
    await this.triggerAOEvent(instance, 'life', 'stop', opts)
    await this.emit('ao:persist', gid)

    const serialized = this.getSerializedAO(instance)

    await this.emit('ao:stopped', [gid, serialized])

    await h.tracer.close()

    if (algoLogWriter) {
      debug('closing log streams for [AO gid %d]', gid)
      algoLogWriter.close()
    }

    ev.removeAllListeners()

    delete this.instances[gid]

    return [
      serialized,
      { id, gid, name, label, args }
    ]
  }

  /**
   * Serializes emits an event for UI updates
   *
   * @param {string} gid - GID of algo order instance to persist
   * @private
   */
  async onAOPersist (gid) {
    const instance = this.instances[gid]

    if (!instance) {
      return
    }

    const serialized = this.getSerializedAO(instance)
    await this.emit('ao:state:update', serialized)
  }

  getSerializedAO (instance) {
    const { state = {} } = instance
    const { id, gid, createdAt } = state
    const ao = this.getAO(id)

    const { meta = {} } = ao
    const { serialize } = meta

    state.lastActive = state.lastActive || createdAt

    return {
      gid,
      createdAt,
      lastActive: state.lastActive,
      algoID: id,
      state: JSON.stringify(serialize(state)),
      active: state.active
    }
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

    const instances = this.getAOInstances()

    await Promise.all(instances.map(async instance => {
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
    }))
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
    const instances = this.getAOInstances()

    await Promise.all(instances.map(async instance => {
      await this.triggerAOEvent(instance, section, eventName, ...args)
    }))
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
 * @default 1000
 */
AOHost.TEARDOWN_GRACE_PERIOD_MS = 1000

module.exports = AOHost
