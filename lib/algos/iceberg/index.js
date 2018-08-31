'use strict'

const Promise = require('bluebird')
const debug = require('debug')('hf-algo:iceberg')

const AlgoOrder = require('../../algo_order')
const UI = require('./ui')
const load = require('./load')
const validateArguments = require('./validate_args')
const processUIParams = require('./process_ui_params')
const registerUI = require('./register_ui')
const deregisterUI = require('./deregister_ui')

/**
 * Iceberg order implementation
 *
 * Sells a large order of `amount` size in chunks of `sliceAmount` units, one
 * at a time. If `excessAsHidden`, the remainder of the order is submitted as
 * hidden.
 *
 * `submitDelay` and `cancelDelay` can be used to delay those order actions.
 *
 * The `orderModifier` can be used to adjust order volume & price, with the ws2
 * client instance accessible via `this.ws` for OB/trade/etc data.
 *
 * @extends AlgoOrder
 */
class IcebergOrder extends AlgoOrder {
  /**
   * Create a new Iceberg order (not auto executed)
   *
   * @param {WSv2} ws
   * @param {RESTv2} rest
   * @param {Object} args
   * @param {string?} args.algoName - defaults to 'iceberg'
   * @param {number?} args.gid - atomic order group ID
   * @param {string} args.symbol - symbol to trade
   * @param {number} args.price - final order price
   * @param {number} args.amount - total order volume, negative to sell
   * @param {number} args.sliceAmount - individual order slice volume
   * @param {string} args.orderType - set directly on atomic orders
   * @param {number} args.submitDelay - ms delay before sending after a fill
   * @param {number} args.cancelDelay - ms delay before cancelling orders
   * @param {boolean?} args.excessAsHidden - if true, a hidden order is created for non-slice volume
   * @param {Object[]?} args.channels - optional extra channels to sub to
   * @param {function(Object):Object?} args.orderModifier - can be used to modify orders before sending
   */
  constructor (ws, rest, args = {}) {
    if (!args.algoName) args.algoName = IcebergOrder._name
    if (!args.uiName) args.uiName = IcebergOrder._uiName
    if (!args.channels) args.channels = []

    const {
      cancelDelay, submitDelay, price, amount, sliceAmount, excessAsHidden,
      orderType
    } = args

    const argsErr = IcebergOrder.validateArguments(args)
    if (argsErr) throw new Error(argsErr)

    super(ws, rest, args, IcebergOrder._ui)

    this.price = price
    this.amount = amount
    this.remainingAmount = Math.abs(amount)
    this.sliceAmount = Math.abs(sliceAmount)
    this.excessAsHidden = excessAsHidden === true
    this.orderType = orderType
    this.submitDelay = submitDelay
    this.cancelDelay = cancelDelay
    this.submitTimeout = null
    this.cancelTimeout = null
  }

  save () {
    return super.save([
      'orderType', 'amount', 'sliceAmount', 'price', 'submitDelay',
      'cancelDelay', 'excessAsHidden', 'remainingAmount'
    ])
  }

  /**
   * Builds a metdata object for generated atomic orders
   *
   * @return {Object} metadata
   */
  _generateMetaData () {
    const { amount, price, sliceAmount, excessAsHidden } = this
    const mul = this.amount < 0 ? -1 : 1

    return {
      label: [
        'Iceberg',
        ` | ${amount} @ ${price} `,
        ` | slice ${mul * sliceAmount}`,

        excessAsHidden
          ? ` | excess ${mul * (Math.abs(amount) - Math.abs(sliceAmount))}`
          : ''
      ].join('')
    }
  }

  /**
   * @return {boolean} partialFill
   */
  isPartiallyFilled () {
    return this.remainingAmount > 0
  }

  /**
   * @return {number} amount
   */
  getFilledAmount () {
    return Math.abs(this.amount) - this.remainingAmount
  }

  /**
   * @private
   */
  _clearTimeouts () {
    if (this.submitTimeout !== null) clearTimeout(this.submitTimeout)
    if (this.cancelTimeout !== null) clearTimeout(this.cancelTimeout)

    this.submitTimeout = null
    this.cancelTimeout = null
  }

  /**
   * @return {Promise} p
   * @private
   */
  _submitNextOrders () {
    const orders = this._genNextOrders()

    return this._sendOrders(orders)
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
    const marketOrder = this.orderType.indexOf('MARKET') !== -1

    if (preview) {
      return this._genPreview()
    }

    this.D(
      'start %j (%d @ %s) slice %d, excess: %j',
      new Date(), this.amount, marketOrder ? 'MARKET' : this.price,
      this.sliceAmount, this.excessAsHidden
    )

    return super.start(opts).then(() => {
      return this._submitNextOrders()
    })
  }

  /**
   * Stops execution and cancels any open orders.
   *
   * @param {Object} opts
   * @return {Promise} p
   */
  stop (opts = {}) {
    this._clearTimeouts()
    this.D('stop')
    return super.stop(opts)
  }

  _genNextOrders () {
    const orders = []
    const nextSliceOrder = this._getSliceOrder()

    if (nextSliceOrder !== null) {
      orders.push(nextSliceOrder)
    }

    if (this.excessAsHidden) {
      const excessOrder = this._getExcessOrder()

      if (excessOrder !== null) {
        orders.push(excessOrder)
      }
    }

    return orders
  }

  _genPreview () {
    return Promise.resolve(this._genNextOrders())
  }

  /**
   * @param {array[]} orders
   * @private
   */
  _onOrderSnapshot (orders) {
    super._onOrderSnapshot(orders)
    return this._cancelOpenOrders()
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
   * @param {array[]} orders
   * @private
   */
  _onOrderClose (orderArr) {
    const order = super._onOrderClose(orderArr)

    if (!order) return // unknown order
    if (order.status.indexOf('CANCELED') !== -1) {
      if (this.isActive() && !this.pendingCanceledIds.has(+order.id)) {
        debug('atomic order cancelled, stopping...')
        this.stop()
      }

      return
    }

    this._handleOrderFill(order)
  }

  /**
   * @param {Order} o - expects internal last fill amount to be updated
   * @return {Promise} p
   * @private
   */
  _handleOrderFill (o) {
    const fillAmount = o.getLastFillAmount()

    if (fillAmount === 0) return Promise.resolve()

    this.remainingAmount -= Math.abs(fillAmount)
    this.emit('fill', o)

    this.D('filled %f @ %f (%f remaining)', fillAmount, o.price, this.remainingAmount)

    if (this._isCancelScheduled()) {
      return Promise.resolve()
    }

    return this._scheduleNextCancel().then(() => {
      if (this.remainingAmount < this._getMinOrderAmount()) {
        this.D('fully filled')
        this.emit('filled')
        return this.stop()
      }

      return this._scheduleNextSubmit()
    })
  }

  /**
   * @return {Promise} p
   * @private
   */
  _scheduleNextSubmit () {
    if (this._isSubmitScheduled()) {
      return Promise.reject(new Error('order submit already scheduled'))
    }

    return new Promise((resolve, reject) => {
      this.D('scheduling order submit in %d ms', this.submitDelay)

      this.submitTimeout = setTimeout(() => {
        this.submitTimeout = null
        this._submitNextOrders().then(resolve).catch(reject)
      }, this.submitDelay)
    })
  }

  /**
   * @return {Promise} p
   * @private
   */
  _scheduleNextCancel () {
    if (this._isCancelScheduled()) {
      return Promise.reject(new Error('mass order cancel already scheduled'))
    }

    return new Promise((resolve, reject) => {
      this.D('scheduling mass order cancel in %d ms', this.cancelDelay)

      this.cancelTimeout = setTimeout(() => {
        this.cancelTimeout = null
        this._cancelOpenOrders().then(resolve).catch(reject)
      }, this.cancelDelay)
    })
  }

  /**
   * @return {boolean} scheduled
   * @private
   */
  _isCancelScheduled () {
    return this.cancelTimeout !== null
  }

  /**
   * @return {boolean} scheduled
   * @private
   */
  _isSubmitScheduled () {
    return this.submitTimeout !== null
  }

  /**
   * @return {Object} order null if no next slice
   * @private
   */
  _getSliceOrder () {
    if (this.remainingAmount < this._getMinOrderAmount()) return null

    const mul = this.amount < 0 ? -1 : 1
    const { orderType = '' } = this

    let o = this._genOrder({
      type: orderType,
      price: orderType.indexOf('MARKET') === -1 ? this.price : undefined,
      amount: mul * Math.min(this.sliceAmount, this.remainingAmount)
    })

    o = this._finalizeOrder(o, 'slice')
    return this._orderBelowMin(o) ? null : o
  }

  /**
   * @return {Object} order null if no excess
   * @private
   */
  _getExcessOrder () {
    if (this.remainingAmount <= this.sliceAmount) return null

    const mul = this.amount < 0 ? -1 : 1
    let o = this._genOrder({
      type: this.orderType,
      price: this.price,
      amount: mul * (this.remainingAmount - this.sliceAmount),
      hidden: true
    })

    o = this._finalizeOrder(o, 'excess')
    return this._orderBelowMin(o) ? null : o
  }
}

IcebergOrder._ui = UI
IcebergOrder._name = 'ao_iceberg'
IcebergOrder._uiName = 'Iceberg'

IcebergOrder.processUIParams = processUIParams
IcebergOrder.validateArguments = validateArguments
IcebergOrder.load = load
IcebergOrder.registerUI = registerUI
IcebergOrder.deregisterUI = deregisterUI

module.exports = IcebergOrder
