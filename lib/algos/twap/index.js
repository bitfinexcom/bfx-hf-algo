'use strict'

const Promise = require('bluebird')
const _isEmpty = require('lodash/isEmpty')
const { Order, OrderBook } = require('bitfinex-api-node/lib/models')

const AlgoOrder = require('../../algo_order')
const UI = require('./ui')

/**
 * Time-Weighted Average Price Order
 *
 * Breaks a larger order up into chunks of `sliceAmount` units, bought/sold
 * every `sliceInterval` ms until fully filled.
 *
 * The `priceTarget` can be a market price (last trade, ob mid/side price) or a
 * numeric price (100.42) with a `priceCondition` to match either the last trade
 * or ob mid/side price.
 *
 * If `tradeBeyondEnd` is false (default), any unfilled orders are cancelled at
 * the end of each interval.
 *
 * The `orderModifier` can be used to adjust order volume & price, with the ws2
 * client instance accessible via `this.ws` for OB/trade/etc data.
 *
 * @extends AlgoOrder
 */
class TWAPOrder extends AlgoOrder {
  /**
   * Create a new TWAP order (not auto executed)
   *
   * @param {WSv2} ws
   * @param {RESTv2} rest
   * @param {Object} args
   * @param {string?} args.algoName - defaults to 'twap'
   * @param {number?} args.gid - atomic order group ID
   * @param {string} args.symbol - symbol to trade
   * @param {number} args.amount - total order size
   * @param {number} args.sliceAmount - total slice size
   * @param {number} args.sliceInterval - duration over which to trade slice
   * @param {(number|string)} args.priceTarget - numeric or market target
   * @param {string?} args.priceCondition - how to match numeric price target
   * @param {string} args.orderType - set directly on atomic orders
   * @param {boolean?} args.tradeBeyondEnd - if true, unfilled orders are not cancelled
   * @param {Object[]?} args.channels - optional extra channels to sub to
   * @param {function(Object):Object?} args.orderModifier - can be used to modify orders before sending
   */
  constructor (ws, rest, args = {}) {
    const { priceTarget } = args
    const targetType = typeof priceTarget
    let err

    if (!args.algoName) args.algoName = TWAPOrder._name
    if (!args.uiName) args.uiName = TWAPOrder._uiName
    if (!Order.type[args.orderType]) err = 'invalid order type'
    if (isNaN(args.amount)) err = 'invalid amount'
    if (isNaN(args.sliceAmount)) err = 'invalid slice amount'
    if (isNaN(args.sliceInterval)) err = 'slice interval not a number'
    if (args.sliceInterval <= 0) err = 'slice interval <= 0'
    if (
      (targetType !== 'string' && targetType !== 'number') ||
      (targetType === 'string' && !TWAPOrder.PRICE_TARGET[priceTarget]) ||
      (targetType === 'number' && priceTarget <= 0)
    ) {
      err = 'Invalid price target'
    }

    if (err) throw new Error(err)

    super(ws, rest, args, TWAPOrder._ui)

    this.amount = args.amount
    this.priceTarget = args.priceTarget
    this.priceCondition = args.priceCondition
    this.sliceAmount = Math.abs(args.sliceAmount)
    this.sliceInterval = args.sliceInterval
    this.tradeBeyondEnd = args.tradeBeyondEnd
    this.orderType = args.orderType
    this.remainingAmount = Math.abs(args.amount)
    this.fillHistory = []
    this.timeoutID = null
    this._hasPriceCondition = !isNaN(this.priceTarget) && this.priceCondition

    if (this._needsTradeData()) {
      this.trackChannels.push({ channel: 'trades' })
    } else if (this._needsOBData()) {
      this.trackChannels.push({ channel: 'book', prec: 'P0', len: '25' })
    }

    this._onTimeoutTriggered = this._onTimeoutTriggered.bind(this)
    this.startTS = Date.now()
  }

  static registerUI (rest) {
    return AlgoOrder.registerUI(rest, TWAPOrder.name, TWAPOrder.ui)
  }

  static deregisterUI (rest) {
    return AlgoOrder.deregisterUI(rest, TWAPOrder.name, TWAPOrder.ui)
  }

  static processUIParams (data) {
    const params = Object.assign({}, data)

    if (params.orderType && !params._margin) {
      params.orderType = `EXCHANGE ${params.orderType}`
    }

    if (params._symbol) {
      params.symbol = params._symbol
      delete params._symbol
    }

    if (params.priceTarget === 'custom') {
      params.priceTarget = params.price
    }

    if (!isNaN(params.sliceInterval)) {
      params.sliceInterval = Number(params.sliceInterval) * 1000
    }

    delete params.price

    if (params.action) {
      if (params.action === 'Sell') {
        params.amount = Number(params.amount) * -1
      }

      delete params.action
    }

    return params
  }

  static load (ws, rest, data) {
    try {
      const o = new TWAPOrder(ws, rest, data)

      o.remainingAmount = data.remainingAmount

      if (typeof data.orderModifier === 'string' && data.orderModifier.length > 0) {
        // eslint-disable-next-line no-new-func
        o.orderModifier = Function(data.orderModifier) // hacky, but it works
      }

      return o
    } catch (e) {
      return e
    }
  }

  getUIName () {
    const type = isNaN(this.priceTarget)
      ? 'scheduled'
      : 'conditional'

    return `${this.uiName} Order [${type}]`
  }

  /**
   * Builds a metdata object for generated atomic orders (displayed in UI order
   * form)
   *
   * @return {Object} metadata
   */
  _generateMetaData () {
    const {
      sliceAmount, sliceInterval, amount, priceTarget, priceCondition,
      tradeBeyondEnd
    } = this

    return {
      label: [
        'TWAP',
        ' | slice ', sliceAmount,
        ' | total ', amount,
        ' | interval ', Math.floor(sliceInterval / 1000), 's',
        ' | target ', priceTarget,
        ' | target == ', priceCondition,
        ' | TBE ', tradeBeyondEnd
      ].join('')
    }
  }

  save () {
    return super.save([
      'priceTarget', 'priceCondition', 'sliceAmount', 'sliceInterval',
      'tradeBeyondEnd', 'orderType', 'remainingAmount', 'amount'
    ])
  }

  /**
   * Starts order execution; rejects if already started.
   *
   * @param {Object} opts
   * @param {boolean} opts.preview - if true, resolves to an order preview
   * @return {Promise} p
   */
  start (opts = {}) {
    const { preview = false } = opts

    if (preview) {
      return this._genPreview()
    }

    this.D('start %j (%d @ %s)', new Date(), this.amount, this.priceTarget)

    if (this.timeoutID !== null) {
      return Promise.reject(
        new Error('timeout scheduled before start, check this')
      )
    }

    return super.start().then(() => {
      this._scheduleOrderTimeout()

      if (isNaN(this.priceTarget)) { // follow the market
        this.D('running in scheduled mode')
      } else {
        this.D('running in condition monitoring mode (%s)', this.priceCondition)
      }

      return null
    })
  }

  /**
   * Stops execution and cancels any open orders.
   *
   * @param {Object} opts
   * @return {Promise} p
   */
  stop (opts = {}) {
    this.D('stop')
    this._clearOrderTimeout()

    return super.stop(opts).then(() => {
      this._logFillHistory()

      return null
    })
  }

  _genPreview () {
    const o = this._getNextSliceOrder()

    if (o !== null && o.price !== null) {
      return Promise.resolve(this._genPreviewOrders())
    }

    return new Promise((resolve, reject) => {
      this._previewCB = (orders) => {
        return super.stop().then(() => resolve(orders)).catch(reject)
      }

      return super.start().catch(reject)
    })
  }

  _genPreviewOrders () {
    const orders = []
    let remAmount = Math.abs(this.amount)
    let o
    let m
    let ts = Date.now()
    let delay

    while (remAmount > 0) {
      o = this._getNextSliceOrder()
      m = o.amount >= 0 ? 1 : -1

      o.amount = Math.min(Math.abs(o.amount), remAmount) * m
      remAmount -= Math.abs(o.amount)

      orders.push(o)

      delay = this._durationToTimeout(ts) + 100

      orders.push({
        label: `DELAY ${Math.floor(delay / 1000)}s`
      })

      ts += delay
    }

    return orders
  }

  /**
   * @private
   */
  _logFillHistory () {
    let totalAmount = 0
    let totalValue = 0

    if (!_isEmpty(this.fillHistory)) {
      this.D('fill history:')
      this.fillHistory.forEach((trade) => {
        totalAmount += trade.fillAmount
        totalValue += trade.price * trade.fillAmount

        this.D(`[trade #%d] %d @ $%d`, trade.cid, trade.fillAmount, trade.price)
      })
    }

    if (totalAmount === 0) {
      return
    }

    this.D(`final vwap: $${totalValue / totalAmount} [${totalAmount} total amount]`)
  }

  /**
   * @param {Order} order
   * @return {number} i
   * @private
   */
  _getOrderInterval (order) {
    return Math.floor((order.mtsCreate - this.startTS) / this.sliceInterval)
  }

  /**
   * 0 indexed
   *
   * @return {number} i
   * @private
   */
  _getCurrentInterval () {
    return Math.floor((Date.now() - this.startTS) / this.sliceInterval)
  }

  /**
   * @return {boolean} val
   * @private
   */
  _hasOrderForCurrentInterval () {
    const orderIds = Object.keys(this.atomicOrders)

    if (orderIds.length > 1) { // sanity check
      throw new Error(`Multiple open orders: ${orderIds}`)
    } else if (orderIds.length === 0) {
      return false
    }

    const o = this.atomicOrders[orderIds[0]]

    return this._getCurrentInterval() === this._getOrderInterval(o)
  }

  /**
   * @return {boolean} val
   * @private
   */
  _needsTradeData () {
    return (
      this._hasTradePriceCondition() ||
      (this.priceTarget === TWAPOrder.PRICE_TARGET.LAST)
    )
  }

  /**
   * @return {boolean} val
   * @private
   */
  _needsOBData () {
    return (
      this._hasOBPriceCondition() ||
      (this.priceTarget === TWAPOrder.PRICE_TARGET.OB_SIDE) ||
      (this.priceTarget === TWAPOrder.PRICE_TARGET.OB_MID)
    )
  }

  /**
   * @return {boolean} val
   * @private
   */
  _hasTradePriceCondition () {
    return (
      this._hasPriceCondition &&
      this.priceCondition === TWAPOrder.PRICE_COND.MATCH_LAST
    )
  }

  /**
   * @return {boolean} val
   * @private
   */
  _hasOBPriceCondition () {
    return this._hasPriceCondition && (
      this.priceCondition === TWAPOrder.PRICE_COND.MATCH_MIDPOINT ||
      this.priceCondition === TWAPOrder.PRICE_COND.MATCH_SIDE
    )
  }

  /**
   * @return {boolean} val
   * @private
   */
  _needsOrder () {
    return !this._hasOrderForCurrentInterval() && !this._hasUnconfirmedOrders()
  }

  /**
   * Submits next order if we have a last price match & condition.
   * Updates internal last price.
   *
   * @param {array[]} trades
   * @private
   */
  _onMatchingTrade (trades) {
    const [trade] = trades
    this.lastPrice = trade[3]

    if (!this._needsTradeData()) return

    if (this._previewCB) {
      return this._previewCB(this._genPreviewOrders())
    }

    if (!this._needsOrder()) return

    if (this.priceTarget === this.lastPrice) {
      this.D('trade price target matched (%d)', this.lastPrice)
      this._submitNextOrder()
    }
  }

  /**
   * Updates internal OB, and submits next order on OB price match & condition.
   *
   * @param {array[]} data
   * @private
   */
  _onMatchingOB (data) {
    if (!this.ob) {
      this.ob = new OrderBook(data)
    } else {
      this.ob.updateFromSnapshot(data)
    }

    if (!this._needsOBData()) return

    if (this._previewCB) {
      return this._previewCB(this._genPreviewOrders())
    }

    if (!this._needsOrder()) return

    const obPrice = this.priceCondition === TWAPOrder.PRICE_COND.MATCH_MIDPOINT
      ? this.ob.midPrice()
      : this.amount > 0
        ? (this.ob.asks[0] || [])[0]
        : (this.ob.bids[0] || [])[0]

    if (this.priceTarget === obPrice) {
      this.D('ob price target matched (%d)', obPrice)
      this._submitNextOrder()
    }
  }

  /**
   * Does nothing if no further order is needed, otherwise it schedules the
   * order timeout at the start of the next interval.
   *
   * @return {boolean} scheduled
   * @private
   */
  _scheduleOrderTimeout () {
    if (this.timeoutID !== null) return false
    if (this.remainingAmount < this._getMinOrderAmount()) return false

    // Note we trigger 100ms before the interval change
    const tOffset = this._durationToTimeout() - 100
    this.timeoutID = setTimeout(this._onTimeoutTriggered, tOffset)

    if (!this._hasPriceCondition) {
      this.D(`scheduled order at ${new Date(Date.now() + tOffset)}`)
    }

    return true
  }

  /**
   * @private
   */
  _clearOrderTimeout () {
    if (this.timeoutID === null) return

    clearTimeout(this.timeoutID)
    this.timeoutID = null
  }

  _durationToTimeout (from = Date.now()) {
    let currIntervalPos = ((from - this.startTS) / this.sliceInterval)
    currIntervalPos -= Math.floor(currIntervalPos)

    return this.sliceInterval * (1 - currIntervalPos)
  }

  /**
   * @return {number} price - null if data is missing
   * @private
   */
  _getCurrentPrice () {
    if (!isNaN(this.priceTarget)) return this.priceTarget

    if (this.priceTarget === TWAPOrder.PRICE_TARGET.LAST) {
      return this.lastPrice || null
    }

    if (!this.ob) return null

    if (this.priceTarget === TWAPOrder.PRICE_TARGET.OB_MID) {
      return this.ob.midPrice()
    } else if (this.priceTarget === TWAPOrder.PRICE_TARGET.OB_SIDE) {
      return this.amount > 0
        ? this.ob.asks[0][0]
        : this.ob.bids[0][0]
    }

    return null
  }

  /**
   * @return {number} amount
   * @private
   */
  _getCurrentAmount () {
    return this.sliceAmount
  }

  /**
   * @private
   */
  _onTimeoutTriggered () {
    this.timeoutID = null

    return Promise.resolve().then(() => {
      if (!this.tradeBeyondEnd) {
        return this._cancelOpenOrders()
      }
    }).then(() => {
      if (!this._hasPriceCondition) {
        return this._submitNextOrder()
      }
    }).then(this._scheduleOrderTimeout.bind(this)).catch((err) => {
      this.D('stopping, error: %j', err)
      this.emit('error', err)

      return this.stop()
    })
  }

  /**
   * @return {Promise} p
   * @private
   */
  _submitNextOrder () {
    if (this.remainingAmount < this._getMinOrderAmount()) return this.stop()

    const o = this._getNextSliceOrder()

    if (o === null) {
      return this.stop()
    } else if (o.price === null) {
      if (!this._hasPriceCondition) {
        this.D('no data for price selection, delaying order')
        this.timeoutID = setTimeout(this._onTimeoutTriggered, 1000)
      } else {
        this.D('no data for price selection')
      }

      return Promise.resolve()
    }

    this.D('sending order for %d @ %d', o.amount, o.price)
    return this._sendOrder(o)
  }

  /**
   * @return {Object} o - null if price data is missing or order is invalid
   * @private
   */
  _getNextSliceOrder () {
    const price = this._getCurrentPrice()
    const amount = this._getCurrentAmount()

    let o = this._genOrder({
      type: this.orderType,
      amount,
      price
    })

    // A null price triggers a wait for price target data
    if (o.price === null) return o

    o = this._finalizeOrder(o)
    return this._orderBelowMin(o) ? null : o
  }

  /**
   * @param {array[]} orders
   * @private
   */
  _onOrderSnapshot (orders) {
    super._onOrderSnapshot(orders)

    this._cancelOpenOrders()
  }

  /**
   * @param {array[]} orders
   * @private
   */
  _onOrderNew (orderArr) {
    const order = super._onOrderNew(orderArr)
    if (order.status.indexOf('PARTIALLY') === -1) return
    this._handleOrderFill(order) // sometimes orders fill before 'on'
  }

  /**
   * @param {array[]} orders
   * @private
   */
  _onOrderUpdate (orderArr) {
    const order = super._onOrderUpdate(orderArr)
    if (order.status.indexOf('PARTIALLY') === -1) return
    this._handleOrderFill(order)
  }

  /**
   * TODO: Refactor; the isActive/pendingCanceledIds handles cancellation of
   *       the entire algo order if the user has manually cancelled an atomic
   *       order. Needs to be broken out onto AlgoOrder
   *
   * @param {array[]} orders
   * @private
   */
  _onOrderClose (orderArr) {
    const order = super._onOrderClose(orderArr)

    if (order.status.indexOf('CANCELED') !== -1) {
      if (this.isActive() && !this.pendingCanceledIds.has(+order.id)) {
        this.D('atomic order cancelled, stopping...')
        this.stop()
      }

      return
    }

    this._handleOrderFill(order)
  }

  /**
   * @param {Order} o - last fill data must be populated
   * @return {Promise} p
   * @private
   */
  _handleOrderFill (o) {
    const fillAmount = o.getLastFillAmount()

    if (fillAmount === 0) return Promise.resolve()

    this.fillHistory.push({
      cid: o.cid,
      price: o.price,
      fillAmount
    })

    this.remainingAmount -= Math.abs(fillAmount)
    this.emit('fill', o)

    this.D('filled %f @ %f (%f remaining)', fillAmount, o.price, this.remainingAmount)

    // Overfill can happen due to dust
    if (this.remainingAmount < this._getMinOrderAmount()) {
      this.D('fully filled')
      this.emit('filled')
      return this.stop()
    }

    return Promise.resolve()
  }
}

const priceTargets = ['LAST', 'OB_MID', 'OB_SIDE']
const priceConditions = ['MATCH_MIDPOINT', 'MATCH_SIDE', 'MATCH_LAST']

TWAPOrder.PRICE_TARGET = {}
TWAPOrder.PRICE_COND = {}

priceTargets.forEach(t => { TWAPOrder.PRICE_TARGET[t] = t })
priceConditions.forEach(c => { TWAPOrder.PRICE_COND[c] = c })

TWAPOrder._ui = UI
TWAPOrder._name = 'ao_twap'
TWAPOrder._uiName = 'TWAP'

module.exports = TWAPOrder
