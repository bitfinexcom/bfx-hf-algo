'use strict'

const Promise = require('bluebird')
const EventEmitter = require('events')
const Debug = require('debug')
const debug = Debug('hf-algo:ao')
const Util = require('util')
const { Order } = require('bfx-api-node-models')

let lastGID = Date.now()
let lastCID = Date.now()

const ACTIVE_ORDERS = {}
const LIMIT_WARNING_SHOWN = {}

/**
 * {
 *   ops: 3,
 *
 *   BTC: {
 *     total: {
 *       amount: 0,
 *       nValue: 0
 *     },
 *
 *     algo: {
 *       amount: 0,
 *       nValue: 0
 *     }
 *   }
 * }
 */
const LIMITS = {}

/**
 * Algorithmic order base class
 *
 * Override `start()` and `stop()` for custom behavior, after a call to super.
 * If subscribed to trades or order books, `_onMatchingTrade` and `_onMatchingOB`
 * are available.
 *
 * Orders with matching group IDs are passed to the order handlers:
 *   `on`: `_onOrderNew`
 *   `os`: `_onOrderSnapshot`
 *   `ou`: `_onOrderUpdate`
 *   `oc`: `_onOrderClose`
 *
 * `_genOrder()` returns a new atomic order with the same group ID and symbol as
 * the algo order.
 *
 * Once configured, it can be submitted via `_sendOrder(o).then(..` and later
 * cancelled with `_cancelOrder(o).then(..`
 *
 * TODO: Refactor constructor to accept params map
 *
 * @extends EventEmitter
 */
class AlgoOrder extends EventEmitter {
  /**
   * Create a new algorithmic order. This class should be extended and not
   * instantiated directly, as it does nothing by itself.
   *
   * @param {WSv2} bfxWS - bfx ws2 transport instance
   * @param {Object} args
   * @param {string?} args.algoName - defaults to 'twap'
   * @param {number?} args.gid - atomic order group ID, defaults to Date.now()
   * @param {string} args.symbol - symbol to trade
   * @param {Object[]?} args.channels - optional extra channels to sub to
   * @param {function(Object):Object?} args.orderModifier - can be used to modify orders before sending
   * @param {Object} uiSpec - bfx order form layout specification
   */
  constructor (ws, rest, args = {}, uiSpec) {
    if (!ws) throw new Error('ws2 client instance required')
    if (!args.symbol) throw new Error('symbol required')
    if (!args.algoName) args.algoName = 'ao'
    if (!args.channels) args.channels = []

    super()

    this.ui = uiSpec
    this.ws = ws
    this.rest = rest
    this.name = args.algoName
    this.uiName = args.uiName
    this.id = args.id
    this.gid = args.gid || lastGID++
    this.symbol = args.symbol
    this.active = !!args.active
    this.atomicOrders = {}
    this.trackChannels = args.channels
    this.unconfirmedOrderCIds = new Set()
    this.pendingCanceledIds = new Set()
    this.orderModifier = args.orderModifier
    this.isSubscribedWS = false // if true, start() was called

    // sometimes 'oc' arrives before 'n' 'on-req'
    // to deal with that, we track closed order IDs to ignore subsequent
    // 'on-req' calls
    this.closedOrders = new Set()

    this._onMatchingTrade = this._onMatchingTrade.bind(this)
    this._onMatchingOB = this._onMatchingOB.bind(this)
    this._onOrderSnapshot = this._onOrderSnapshot.bind(this)
    this._onOrderNew = this._onOrderNew.bind(this)
    this._onOrderUpdate = this._onOrderUpdate.bind(this)
    this._onOrderClose = this._onOrderClose.bind(this)

    this.D = Debug(`hf:ao:${this.name}`)
  }

  static async registerAlgoUIs (rest, algos) {
    const payload = {}

    for (let i = 0; i < algos.length; i += 1) {
      payload[algos[i]._name] = algos[i]._ui
    }

    return rest.updateSettings({
      'api:bitfinex_algorithmic_orders': payload
    })
  }

  static async deregisterAlgoUIs (rest) {
    return rest.deleteSettings('algorithmic_orders')
  }

  static getAlgoUISettings (rest) {
    return rest.getSettings(['algorithmic_orders'], (_, res = []) => {
      const [aos = {}] = res
      const aoKeys = Object.keys(aos)
      const settings = {}

      for (let i = 0; i < aoKeys.length; i += 1) {
        settings[aoKeys[i]] = aos[aoKeys[i]]
      }

      return settings
    })
  }

  static registerUI (rest, name, ui) {
    return rest.getSettings(['algorithmic_orders'], (_, res = []) => {
      const [aos = {}] = res

      aos[name] = ui

      return rest.updateSettings({
        algorithmic_orders: aos
      })
    })
  }

  static deregisterUI (rest, name) {
    return rest.getSettings(['algorithmic_orders'], (_, res = []) => {
      const [aos = {}] = res

      if (!aos[name]) return Promise.resolve()
      delete aos[name]

      return rest.updateSettings({
        algorithmic_orders: aos
      })
    })
  }

  getName () {
    return this.name
  }

  getUIName () {
    return `${this.uiName} Order`
  }

  save (extraKeys = []) {
    const out = {}
    const keys = [
      'gid', 'symbol', 'active',
      ...extraKeys
    ]

    for (let i = 0; i < keys.length; i += 1) {
      out[keys[i]] = this[keys[i]]
    }

    if (typeof this.orderModifier === 'function') {
      out.orderModifier = '' + this.orderModifier
    }

    return out
  }

  /**
   * Subscribes to the relevant ws channels, for order/etc updates.
   * Extend this to add startup logic. Channels are provided in the constructor
   *
   * @param {Object} opts
   * @param {boolean} opts.persist - default true
   * @return {Promise} p
   */
  start (opts = {}) {
    const { persist = true } = opts

    return Promise.resolve().then(() => {
      this._subChannels()
      this.active = true

      if (persist) {
        this.emit('persist', this)
      }

      ACTIVE_ORDERS[this.gid] = this

      this.emit('started')

      return null
    })
  }

  /**
   * Cancels open orders & unsubscribes from relevant ws channels.
   * Extend this to add shutdown logic
   *
   * @param {Object} opts
   * @param {boolean} opts.persist - default true
   * @return {Promise} p
   */
  stop (opts = {}) {
    const { persist = true } = opts

    delete ACTIVE_ORDERS[this.gid]

    this._unsubChannels()
    this.active = false

    if (persist) {
      this.emit('persist', this)
    }

    if (this.ws.isAuthenticated()) {
      return this._cancelOpenOrders().then(() => this.emit('stopped'))
    }

    this.emit('stopped')

    return Promise.resolve()
  }

  /**
   * @return {boolean} active
   */
  isActive () {
    return this.active
  }

  /**
   * @private
   */
  _subChannels () {
    if (this.isSubscribedWS) {
      return Promise.reject(new Error('already subscribed'))
    }

    const symbol = this.symbol
    const pair = this.symbol.substring(1)
    const base = { cbGID: this.gid }
    const orderChanData = Object.assign({
      cbGID: this.gid,
      gid: this.gid,
      symbol: this.symbol
    }, base)

    this.ws.onTrades(Object.assign({ pair }, base), this._onMatchingTrade)
    this.ws.onOrderBook(Object.assign({ symbol }, base), this._onMatchingOB)
    this.ws.onOrderSnapshot(orderChanData, this._onOrderSnapshot)
    this.ws.onOrderNew(orderChanData, this._onOrderNew)
    this.ws.onOrderUpdate(orderChanData, this._onOrderUpdate)
    this.ws.onOrderClose(orderChanData, this._onOrderClose)

    this.trackChannels.forEach((chan) => {
      const packet = Object.assign(chan, { symbol })

      this.ws.managedSubscribe(chan.channel, chan.key || symbol, packet)
    })

    this.isSubscribedWS = true
  }

  /**
   * @private
   */
  _unsubChannels () {
    if (!this.isSubscribedWS) {
      return Promise.reject(new Error('not subscribed'))
    }

    this.trackChannels.forEach(({ channel, key }) => {
      this.ws.managedUnsubscribe(channel, key || this.symbol)
    })

    this.ws.removeListeners(this.gid)
    this.isSubscribedWS = false
  }

  /**
   * Called when a trade matching our symbol has been received, if we are
   * subscribed to the relevant trades channel. Extend this to act on trades.
   *
   * @param {Array[][]|Array[]} trade - an array of trade(s) (single trade unless snap)
   */
  _onMatchingTrade (trade) {}

  /**
   * Called when an order book snapshot or update matching our symbol has been
   * received, if we are subscribed to the relevant OB channel. Extend this to
   * add on OB updates.
   *
   * Note that the OB is maintained on the transport and updated, so the ref
   * should never change for the same symbol, only the contents. Auto-sorted.
   *
   * @param {OrderBook} ob
   */
  _onMatchingOB (ob) {}

  /**
   * Called when an order snapshot is received from the server, pre-filtered for
   * our GID. Use this to validate existing atomic orders, and integrate them
   * into the local dataset.
   *
   * @param {Array[]} orders
   */
  _onOrderSnapshot (orders) {
    this.atomicOrders = {}

    orders.forEach((order) => {
      const o = new Order(order, this.ws)
      o.registerListeners()

      this.atomicOrders[o.cid] = o
    })

    this.D(`integrated snapshot of ${orders.length} order(s)`)
  }

  /**
   * Called when an order matching our GID has been closed on the server. Extend
   * to act upon order execution (or cancellation)
   *
   * @param {Array} orderArr
   * @return {Order} order - deleted order
   */
  _onOrderClose (orderArr) {
    this.D(`recv order close for order ${orderArr[2]} (${orderArr[13]})`)
    let o = this.atomicOrders[orderArr[2]]

    if (o) {
      o._onWSOrderUpdate(orderArr)
      o.removeListeners()
      delete this.atomicOrders[o.cid]
    } else {
      this.closedOrders.add(orderArr[0]) // ignore on-req in the future

      o = new Order(orderArr, this.ws)

      // Track partial fills on orders that close before the 'on' packet
      if (o.amount !== o.amountOrig) {
        o._lastAmount = o.amountOrig
      }
    }

    return o
  }

  /**
   * Called when an order matching our GID has been updated; this usually means
   * a partial fill.
   *
   * @param {Array} orderArr
   */
  _onOrderUpdate (orderArr) {
    this.D(`recv order update for order ${orderArr[2]} (${orderArr[13]})`)
    let o = this.atomicOrders[orderArr[2]]

    if (o) {
      o._onWSOrderUpdate(orderArr)
    } else { // update for an order we haven't seen before
      o = new Order(orderArr, this.ws)
      o.registerListeners()
      this.atomicOrders[orderArr[2]] = o
    }

    return o
  }

  /**
   * Called when an order matching our GID has been created
   *
   * @param {Array} orderArr
   */
  _onOrderNew (order) {
    this.D(`recv new order ${order[2]} (${order[13]})`)

    const o = new Order(order, this.ws)
    o.registerListeners()
    this.atomicOrders[o.cid] = o

    return o
  }

  /**
   * @return {boolean} val
   * @private
   */
  _hasUnconfirmedOrders () {
    return this.unconfirmedOrderCIds.size > 0
  }

  /**
   * @param {number} cid
   * @return {boolean} val
   * @private
   */
  _isUnconfirmedCId (cid) {
    return this.unconfirmedOrderCIds.has(cid)
  }

  /**
   * @return {string} currency - i.e. BTC in tBTCUSD
   */
  getBaseCurrency () {
    return this.symbol.substring(1, 4)
  }

  /**
   * @return {string} currency - i.e. USD in tBTCUSD
   */
  getQuoteCurrency () {
    return this.symbol.substring(4)
  }

  /**
   * @return {number} nv
   */
  getActiveNotionalValue () {
    return Object
      .values(this.atomicOrders)
      .map(o => o.getNotionalValue())
      .reduce((sum, nv) => { return sum + nv }, 0)
  }

  /**
   * @return {number} amount
   */
  getActiveAmount () {
    return Object
      .values(this.atomicOrders)
      .map(o => o.amount)
      .reduce((sum, a) => { return sum + a }, 0)
  }

  /**
   * @return {AlgoOrder[]} activeOrders
   */
  static getActiveOrders () {
    return Object.values(ACTIVE_ORDERS)
  }

  /**
   * @return {number[]} activeIds
   */
  static getActiveOrderIds () {
    return Object.keys(ACTIVE_ORDERS)
  }

  /**
   * @return {AlgoOrder[]} orders
   */
  static getOrdersByBaseCurrency (c) {
    return Object
      .values(ACTIVE_ORDERS)
      .filter(o => o.getBaseCurrency() === c)
  }

  /**
   * @return {AlgoOrder[]} orders
   */
  static getOrdersByQuoteCurrency (c) {
    return Object
      .values(ACTIVE_ORDERS)
      .filter(o => o.getQuoteCurrency() === c)
  }

  /**
   * @return {number} nv
   */
  static getActiveNotionalValue (currency) {
    return AlgoOrder.getOrdersByQuoteCurrency(currency)
      .map(o => o.getActiveNotionalValue())
      .reduce((sum, nv) => { return sum + nv }, 0)
  }

  /**
   * @return {number} amount
   */
  static getActiveAmount (currency) {
    return AlgoOrder.getOrdersByBaseCurrency(currency)
      .map(o => o.getActiveAmount())
      .reduce((sum, nv) => { return sum + nv }, 0)
  }

  /**
   * @return {Object} limits - with 'algo' and 'total' keys
   */
  static getLimits (currency) {
    if (!LIMITS[currency]) {
      if (!LIMIT_WARNING_SHOWN[currency]) {
        debug(`warning: no limit configured for ${currency}`)
        LIMIT_WARNING_SHOWN[currency] = true
      }

      return null
    }

    return LIMITS[currency]
  }

  /**
   * @param {Array} order
   * @return {Error} err - null if within limits
   * @private
   */
  _orderWithinLimits (order = []) {
    const quoteC = order instanceof Order
      ? order.getQuoteCurrency()
      : Order.getQuoteCurrency(order)

    const baseC = order instanceof Order
      ? order.getBaseCurrency()
      : Order.getBaseCurrency(order)

    const quoteL = AlgoOrder.getLimits(quoteC) || {}
    const quoteLAlgo = quoteL.algo || {}
    const quoteLTotal = quoteL.total || {}
    const baseL = AlgoOrder.getLimits(baseC) || {}
    const baseLAlgo = baseL.algo || {}
    const baseLTotal = baseL.total || {}

    const price = order[16]
    const amount = order[6]
    const orderNV = price * amount
    const activeNV = this.getActiveNotionalValue()
    const activeAmount = this.getActiveAmount()
    const globalNV = AlgoOrder.getActiveNotionalValue(quoteC)
    const globalAmount = AlgoOrder.getActiveAmount(baseC)

    if (this._exceedsOPS()) {
      return new Error(Util.format(
        'order rate-limit exceeded (%d ops)', AlgoOrder.limits.ops
      ))
    } if (quoteLTotal.nValue && ((globalNV + orderNV) > quoteLTotal.nValue)) {
      return new Error(Util.format(
        'order exceeds global notional value cap for %s (%f + %f > %f)',
        quoteC, globalNV, orderNV, quoteLTotal.nValue
      ))
    } else if (baseLTotal.amount && ((globalAmount + amount) > baseLTotal.amount)) {
      return new Error(Util.format(
        `order exceeds global amount limit for %s (%f + %f > %f)`,
        baseC, globalAmount, amount, baseLTotal.amount
      ))
    } else if (quoteLAlgo.nValue && ((activeNV + orderNV) > quoteLAlgo.nValue)) {
      return new Error(Util.format(
        'order exceeds per-algo order notional value cap for %s (%f + %f > %f)',
        quoteC, activeNV, orderNV, quoteLAlgo.nValue
      ))
    } else if (baseLAlgo.amount && ((activeAmount + amount) > baseLAlgo.amount)) {
      return new Error(Util.format(
        'order exceeds per-algo order amount limit for %s (%f + %f > %f)',
        baseC, activeAmount, amount, baseLAlgo.amount
      ))
    }

    return null
  }

  /**
   * @private
   */
  _trackOPS () {
    if (!this._opsTS || (Date.now() - this._opsTS) > 1000) {
      this._opsTS = Date.now()
      this._opsCount = 1
      return
    }

    this._opsCount++
  }

  _exceedsOPS () {
    const limit = AlgoOrder.limits.ops

    if (isNaN(limit)) return false
    if (limit <= 0) return true
    if (!this._opsTS || (Date.now() - this._opsTS) > 1000) {
      return false
    }

    return (this._opsCount + 1) > limit
  }

  /**
   * Optional, the returned object is attached to the 'on' payload's meta field
   *
   * @return {object} meta
   */
  _generateMetaData () {
    return {}
  }

  /**
   * @param {Orders[]|array[]} orders
   * @return {Promise} p
   * @private
   */
  _sendOrders (orders) {
    return Promise.all(orders.map((order) => {
      return this._sendOrder(order).then((o) => {
        this.D('order cid %d has id %d', o.cid, o.id)
      })
    }))
  }

  /**
   * Submit an order to the server over ws. Order confirmation can be checked
   * by cid with _isUnconfirmedCId()
   *
   * @param {Order|Array|Object} order
   * @return {Promise} p - resolves on order confirmation, rejects on error
   */
  _sendOrder (order) {
    const limitErr = this._orderWithinLimits(order)

    if (limitErr) {
      return Promise.reject(limitErr)
    }

    this.unconfirmedOrderCIds.add(order.cid)
    this._trackOPS()

    order.meta = this._generateMetaData()

    return this.ws.submitOrder(order).then((orderArr) => {
      this.unconfirmedOrderCIds.delete(order.cid)

      this.D(`submitted order for ${order.amount} @ ${order.price} [${order.cid}]`)

      // If the order is already closed, it means the 'oc' packet arrived
      // before the 'on-req' confirmation notification. So, don't update
      // the atomic order set, the order is already dead
      if (this.closedOrders.has(orderArr[0])) {
        this.closedOrders.delete(orderArr[0])
        delete this.atomicOrders[orderArr[2]] // just in case
        return new Order(orderArr, this.ws)
      }

      // Spawn new order if it hasn't been created by another handler already
      let o = this.atomicOrders[orderArr[2]]

      if (!o) {
        o = new Order(orderArr, this.ws)
        o.registerListeners()
        this.atomicOrders[orderArr[2]] = o
      }

      return o
    })
  }

  /**
   * @return {Promise} p
   */
  _cancelOpenOrders () {
    const orders = Object.values(this.atomicOrders)
    if (orders.length === 0) return Promise.resolve()

    this.D(`cancelling ${orders.length} open orders`)

    return Promise.all(orders.map(o => this._cancelOrder(o)))
  }

  /**
   * @param {Object|Array} order
   * @return {Promise} p
   */
  _cancelOrder (order) {
    const id = +order.id

    this.pendingCanceledIds.add(id)
    this.D(`cancelling order ${id}`)

    return this.ws.cancelOrder(id)
  }

  /**
   * @return {number} amount
   */
  _getMinOrderAmount () {
    const base = this.getBaseCurrency()

    if (base === 'BTC' || base === 'ZEC') {
      return 0.01
    } else {
      return 0.1
    }
  }

  /**
   * Utility to generate an order object with our GID & symbol
   *
   * @param {Object} data - extra order data to be merged in
   * @return {Order} order
   */
  _genOrder (data) {
    return new Order(Object.assign({
      gid: this.gid,
      symbol: this.symbol,
      cid: lastCID++
    }, data))
  }

  /**
   * Passes the provided order through our order modifier (if we have one) and
   * returns the result. The optional meta value is passed as-is to the modifier
   * @param {Object} order
   * @param {*?} meta
   * @return {Object} finalOrder
   */
  _finalizeOrder (o, meta) {
    return this.orderModifier ? this.orderModifier(o, meta) : o
  }

  /**
   * @param {Object} o
   * @return {boolean} val
   */
  _orderBelowMin (o) {
    return Math.abs(o.amount) < this._getMinOrderAmount()
  }

  /**
   * @return {Array} data
   */
  serialize () {
    return [
      this.id,
      this.gid,
      this.symbol
    ]
  }
}

AlgoOrder.limits = LIMITS

module.exports = AlgoOrder
