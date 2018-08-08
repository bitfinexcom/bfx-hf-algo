'use strict'

const Promise = require('bluebird')
const _Throttle = require('lodash.throttle')
const _isFinite = require('lodash/isFinite')

const AlgoOrder = require('../../algo_order')
const { Order, OrderBook } = require('bitfinex-api-node/lib/models')
const { NoDataError } = require('../../errors')
const UI = require('./ui')

const MAX_SUBMIT_OPS = 0.5

/**
 * Simple static market maker implementation
 *
 * Submits orders to buy & sell the specified `amount` over the specified
 * `spread`, with either a literal or OB price target (mid price)
 *
 * @extends AlgoOrder
 */
class MarketMakerOrder extends AlgoOrder {
  /**
   * Create a new order (not auto executed)
   *
   * The spread can be specified either as a fixed delta or percentage off of
   * the target price, or paired with min/max for scaled orders.
   *
   * @param {WSv2} ws
   * @param {RESTv2} rest
   * @param {Object} args
   * @param {string?} args.algoName - defaults to 'market_maker'
   * @param {number?} args.gid - atomic order group ID
   * @param {string} args.symbol - symbol to trade
   * @param {string|number} args.priceTarget - numeric or 'OB_MID'
   * @param {number} args.amount - total volume split evenly across buy/sell
   * @param {number?} args.amountBuy - total buy amount, taken from 'amount' if available
   * @param {number?} args.amountSell - total sell amount, taken from 'amount' if available
   * @param {number?} args.amountDPerc - max % to vary amount for scaled orders
   * @param {number?} args.amountSellDPerc - sell only, see amountDPerc
   * @param {number?} args.amountBuyDPerc - buy only, see amountDPerc
   * @param {number} args.spread - total distance between buy/sell prices
   * @param {number?} args.spreadMin - min spread for scaled orders
   * @param {number?} args.spreadMax - max spread for scaled orders
   * @param {number?} args.spreadPerc - spread as a percentage of priceTarget
   * @param {number?} args.spreadPercMin - min spread perc for scaled orders
   * @param {number?} args.spreadPercMax - max spread perc for scaled orders
   * @param {number?} args.orderCount - for scaled orders, defaults to 2
   * @param {number?} args.priceDPerc - max step price distortion as % of step spread
   * @param {number?} args.sellPriceDPerc - sell only, see priceDPerc
   * @param {number?} args.buyPriceDPerc - buy only, see priceDPerc
   * @param {string} args.orderType - set directly on atomic orders
   * @param {function(Object):Object?} args.orderModifier - can be used to modify orders before sending
   */
  constructor (ws, rest, args = {}) {
    if (!isNaN(args.amountSell)) args.amountSell = Math.abs(args.amountSell)
    if (!args.orderCount) args.orderCount = 2
    if (!args.algoName) args.algoName = MarketMakerOrder._name
    if (!args.uiName) args.uiName = MarketMakerOrder._uiName
    if (!args.channels) args.channels = []

    const argsErr = MarketMakerOrder.validateArguments(args)
    if (argsErr) throw new Error(argsErr)

    super(ws, rest, args, MarketMakerOrder._ui)

    this.orderType = args.orderType
    this.orderCount = args.orderCount
    this.priceTarget = args.priceTarget
    this.priceDPerc = MarketMakerOrder.priceDPercForArgs(args)
    this.amount = MarketMakerOrder.amountForArgs(args)
    this.amountDPerc = MarketMakerOrder.amountDPercForArgs(args)
    this.spread = MarketMakerOrder.spreadForArgs(args)
    this.ownMidPrice = 0
    this.midPrice = null
    this.previewCB = null

    if (this._needsOBData()) {
      this.trackChannels.push({ channel: 'book', prec: 'P0', len: '25' })
    }

    this.resetRemainingAmount()
    this._resubmitOrders = _Throttle(
      this._resubmitOrders.bind(this),
      1000 / MAX_SUBMIT_OPS
    )
  }

  save () {
    return super.save([
      'orderType', 'orderCount', 'priceTarget', 'priceDPerc', 'amount',
      'amountDPerc', 'spread', 'remainingBuyAmount', 'remainingSellAmount'
    ])
  }

  static load (ws, rest, data) {
    try {
      const mm = new MarketMakerOrder(ws, rest, data)

      mm.remainingBuyAmount = data.remainingBuyAmount
      mm.remainingSellAmount = data.remainingSellAmount

      if (typeof data.orderModifier === 'string' && data.orderModifier.length > 0) {
        // eslint-disable-next-line no-new-func
        mm.orderModifier = Function(data.orderModifier) // hacky, but it works
      }

      return mm
    } catch (e) {
      return e
    }
  }

  static registerUI (rest) {
    return AlgoOrder.registerUI(rest, MarketMakerOrder.name, MarketMakerOrder.ui)
  }

  static deregisterUI (rest) {
    return AlgoOrder.deregisterUI(rest, MarketMakerOrder.name, MarketMakerOrder.ui)
  }

  static validateArguments (args = {}) {
    if (!args.algoName) return 'No algo ordername specified'
    if (!Order.type[args.orderType]) return 'Invalid order type'

    // Amount is user-supplied (it is split into buy/sell  init)
    if (_isFinite(args.amount) && !args.amount.buy) {
      if (isNaN(args.amount)) return 'Amount not a number'
      if (args.amount < 0) return 'Amount less than zero'
    }

    if (!isNaN(args.orderCount) && args.orderCount < 2) {
      return 'Invalid order count (<2)'
    } else if (args.orderCount % 2 !== 0) {
      return 'Order count not even'
    } else if (!isNaN(args.priceTarget) && args.priceTarget <= 0) {
      return 'Fixed price target not positive'
    } else if (
      isNaN(args.priceTarget) &&
      !MarketMakerOrder.PRICE_TARGET[args.priceTarget]
    ) {
      return 'Unrecognized market price target'
    }

    const spread = MarketMakerOrder.spreadForArgs(args)
    const amount = MarketMakerOrder.amountForArgs(args)
    const amountDPerc = MarketMakerOrder.amountDPercForArgs(args)
    const priceDPerc = MarketMakerOrder.priceDPercForArgs(args)

    if (isNaN(spread.min.v) || isNaN(spread.max.v)) {
      return 'Invalid spread parameters'
    } else if (spread.min.type === spread.max.type && spread.min.v > spread.max.v) {
      return 'Spread min greater than max'
    } else if (isNaN(amount.buy) || isNaN(amount.sell)) {
      return 'Invalid amount parameters'
    } else if (
      (amount.buy > args.amount) ||
      (amount.sell > args.amount) ||
      (amount.buy + amount.sell > args.amount)
    ) {
      return 'Buy/sell amounts exceed total amount'
    } else if (isNaN(amountDPerc.buy) || isNaN(amountDPerc.sell)) {
      return 'Invalid amount disortion parameters'
    } else if (isNaN(priceDPerc.buy) || isNaN(priceDPerc.sell)) {
      return 'Invalid price disortion parameters'
    }

    return null
  }

  static spreadForArgs (args = {}) {
    if (typeof (args.spread || {}).min !== 'undefined') return args.spread

    return {
      fixed: !(
        (args.spreadPercMin >= 0 || args.spreadMin >= 0) ||
        (args.spreadPercMax >= 0 || args.spreadMax >= 0)
      ),

      min: {
        type: args.spreadPercMin >= 0 || args.spreadPerc >= 0 ? 'perc' : 'd',
        v: args.spreadPercMin >= 0 //
          ? args.spreadPercMin // perc-min
          : args.spreadMin >= 0 //
            ? args.spreadMin // or min
            : args.spreadPerc >= 0 //
              ? args.spreadPerc // or perc
              : args.spread // or spread
      },

      max: {
        type: args.spreadPercMax >= 0 || args.spreadPerc >= 0 ? 'perc' : 'd',
        v: args.spreadPercMax >= 0 //
          ? args.spreadPercMax // perc-max
          : args.spreadMax >= 0 //
            ? args.spreadMax // or max
            : args.spreadPerc >= 0 //
              ? args.spreadPerc // or perc
              : args.spread // or spread
      }
    }
  }

  static amountForArgs (args = {}) {
    if (typeof (args.amount || {}).buy !== 'undefined') return args.amount

    return {
      buy: args.amountBuy >= 0
        ? args.amountBuy
        : args.amountSell >= 0
          ? args.amount - args.amountSell
          : args.amount / 2.0,

      sell: args.amountSell >= 0
        ? args.amountSell
        : args.amountBuy >= 0
          ? args.amount - args.amountBuy
          : args.amount / 2.0
    }
  }

  static amountDPercForArgs (args = {}) {
    if (typeof (args.amountDPerc || {}).buy !== 'undefined') return args.amountDPerc

    return {
      buy: args.amountBuyDPerc >= 0
        ? args.amountBuyDPerc
        : args.amountDPerc >= 0
          ? args.amountDPerc
          : 0,

      sell: args.amountSellDPerc >= 0
        ? args.amountSellDPerc
        : args.amountDPerc >= 0
          ? args.amountDPerc
          : 0
    }
  }

  static priceDPercForArgs (args = {}) {
    if (typeof (args.priceDPerc || {}).buy !== 'undefined') return args.priceDPerc

    return {
      buy: args.buyPriceDPerc >= 0
        ? args.buyPriceDPerc
        : args.priceDPerc >= 0
          ? args.priceDPerc
          : 0,

      sell: args.sellPriceDPerc >= 0
        ? args.sellPriceDPerc
        : args.priceDPerc >= 0
          ? args.priceDPerc
          : 0
    }
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
      delete params.price
    }

    if (params.amountBuySell !== true) {
      delete params.amountBuy
      delete params.amountSell
    }

    if (params.priceDPBuySell !== true) {
      delete params.sellPriceDPerc
      delete params.buyPriceDPerc
    }

    if (params.amountDPBuySell !== true) {
      delete params.amountBuyDPerc
      delete params.amountSellDPerc
    }

    delete params.priceDPBuySell
    delete params.amountDPBuySell
    delete params.amountBuySell

    return params
  }

  /**
   * Builds a metdata object for generated atomic orders (displayed in UI order
   * form)
   *
   * @return {Object} metadata
   */
  _generateMetaData () {
    const { min, max } = this.spread
    const { sell, buy } = this.amount
    const { orderCount } = this

    return {
      label: [
        'Market Maker',
        ' | sell ', sell,
        ' | buy ', buy,
        ' | spread ', [
          `${min.v}${min.type === 'perc' ? '%' : ''}`,
          `${max.v}${max.type === 'perc' ? '%' : ''}`
        ].join(' - '),
        ` | ${orderCount} orders`
      ].join('')
    }
  }

  resetRemainingAmount () {
    this.remainingBuyAmount = this.amount.buy
    this.remainingSellAmount = this.amount.sell

    this.emit('persist')
  }

  /**
   * @return {boolean} val
   * @private
   */
  _needsOBData () {
    return this.priceTarget === MarketMakerOrder.PRICE_TARGET.OB_MID
  }

  /**
   * Submits initial orders, rejects if already started
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

    this.D(
      'start %j (sell %f, buy %f, spread min %f%s max %f%s)',
      new Date(),
      this.amount.sell, this.amount.buy,
      this.spread.min.v, this.spread.min.type === 'perc' ? '%' : '',
      this.spread.max.v, this.spread.max.type === 'perc' ? '%' : ''
    )

    return super.start(opts).then(() => {
      return this._genSubmitOrders()
    }).catch(NoDataError, () => {
      this.D('price data not available, waiting...')
    })
  }

  _genPreview () {
    const priceTarget = this.getPriceTarget()

    if (priceTarget !== null) {
      return Promise.resolve(this.genOrders(priceTarget))
    }

    return new Promise((resolve, reject) => {
      this._previewCB = (orders) => {
        return super.stop({ persist: false })
          .then(() => resolve(orders)).catch(reject)
      }

      return super.start({ persist: false }).catch(reject)
    })
  }

  /**
   * Drop old orders, since we can't persist remaining buy/sell amount
   *
   * @param {array[]} orders
   * @private
   */
  _onOrderSnapshot (orders) {
    orders.forEach((order) => {
      this._cancelOrder(order)
    })
  }

  /**
   * @param {array[]} order
   * @private
   */
  _onOrderUpdate (order) {
    const o = super._onOrderUpdate(order)

    if (o) {
      if (o.status.indexOf('PARTIALLY') === -1) return

      this._handleOrderFill(o)
    }
  }

  /**
   * @param {array[]} order
   * @private
   */
  _onOrderClose (order) {
    const o = super._onOrderClose(order)

    if (o) {
      if (o.status.indexOf('CANCELED') !== -1) return
      this._handleOrderFill(o)
    }
  }

  /**
   * Submits orders on OB price target match, canceling any existing ones
   *
   * @param {array[]} ob
   * @private
   */
  _onMatchingOB (ob) {
    if (this.priceTarget !== MarketMakerOrder.PRICE_TARGET.OB_MID) return

    const newMid = OrderBook.arrayOBMidPrice(ob)

    if (this.midPrice === null) { // was awaiting data
      this.midPrice = newMid

      // Check if we need to bail early in preview mode
      if (this._previewCB) {
        return this._previewCB(this.genOrders(newMid))
      }

      // Ignore the order attempt w/ incomplete data
      return this._genSubmitOrders()
        .catch(NoDataError, (e) => {})
        .catch((e) => {
          console.error(e.message)
          console.error(e.trace)
        })
    }

    if (newMid !== this.midPrice && newMid !== this.ownMidPrice) {
      if (Math.abs(newMid - this.midPrice) < 25) return // TOOD: Break out threshold

      this.D('mid change %f -> %f', this.midPrice, newMid)
      this.midPrice = newMid

      return this._resubmitOrders()
    }
  }

  _resubmitOrders () {
    return this._cancelOpenOrders().then(() => {
      return this._genSubmitOrders()
    })
  }

  /**
   * @return {Promise} p
   * @private
   */
  _genSubmitOrders () {
    if (this._hasUnconfirmedOrders()) return Promise.resolve()

    const priceTarget = this.getPriceTarget()

    if (!priceTarget) {
      return Promise.reject(new NoDataError('Price not available'))
    }

    const orders = this.genOrders(priceTarget)

    if (orders.length === 0) return Promise.resolve()

    return this._sendOrders(orders)
  }

  /**
   * @param {number} priceTarget
   * @return {Order[]} orders
   * @private
   */
  genOrders (priceTarget) {
    const spreadMin = this.spread.min.type === 'perc'
      ? priceTarget * this.spread.min.v
      : this.spread.min.v

    // Note we prevent max < min
    const spreadMax = Math.max(spreadMin, this.spread.max.type === 'perc'
      ? priceTarget * this.spread.max.v
      : this.spread.max.v)

    const steps = this.orderCount / 2.0
    const stepSpread = (spreadMax - spreadMin) / (steps - 1)
    const orders = []

    let remainingBuyAmount = this.remainingBuyAmount
    let remainingSellAmount = this.remainingSellAmount

    // TODO: Refactor, break out distortion steps
    for (let i = 0; i < steps; i++) {
      const spread = steps === 1
        ? (spreadMin + spreadMax) / 2.0
        : spreadMin + ((spreadMax - spreadMin) * (i / (steps - 1)))

      let buyPrice = priceTarget - (spread / 2.0)
      let sellPrice = priceTarget + (spread / 2.0)

      // Apply price distortion for all but the last step, as % between this
      // step's spread and the next
      if (i !== steps - 1) {
        if (this.priceDPerc.buy >= 0) {
          const d = stepSpread * this.priceDPerc.buy
          buyPrice += (d / 2.0) - (Math.random() * d)
        }

        if (this.priceDPerc.sell >= 0) {
          const d = stepSpread * this.priceDPerc.sell
          sellPrice += (d / 2.0) - (Math.random() * d)
        }
      }

      // Apply amount distortion
      // Note that we use the actual remaining amount here
      let buyAmount = this.remainingBuyAmount / steps
      let sellAmount = this.remainingSellAmount / steps

      if (this.amountDPerc.buy >= 0) {
        const f = buyAmount * this.amountDPerc.buy
        buyAmount += (f / 2.0) - (Math.random() * f)
      }

      if (this.amountDPerc.sell >= 0) {
        const f = sellAmount * this.amountDPerc.sell
        sellAmount += (f / 2.0) - (Math.random() * f)
      }

      // Pass through user modifier & attach metadata
      const buyOrder = this._finalizeOrder(this._genOrder({
        type: this.orderType,
        amount: buyAmount,
        price: buyPrice,
        postonly: true
      }))

      const sellOrder = this._finalizeOrder(this._genOrder({
        type: this.orderType,
        amount: -sellAmount,
        price: sellPrice,
        postonly: true
      }))

      if (i === 0) {
        this.ownMidPrice = (sellOrder.price + buyOrder.price) / 2.0
      }

      // Catch easy user modifier error
      if (buyOrder.amount < 0) {
        throw new Error('Negative buy order amount: %f', buyOrder.amount)
      } else if (sellOrder.amount > 0) {
        throw new Error('Positive sell order amount: %f', sellOrder.amount)
      }

      // Don't overshoot due to distortion or user modifier
      buyOrder.amount = Math.min(buyOrder.amount, remainingBuyAmount)
      sellOrder.amount = -1.0 * Math.min(Math.abs(sellOrder.amount), remainingSellAmount)

      // Include any leftover dust
      const lastStep = i === steps - 1
      const remBuy = remainingBuyAmount - buyOrder.amount
      const remSell = remainingSellAmount + sellOrder.amount

      if (remBuy > 0 && (remBuy < this._getMinOrderAmount() || lastStep)) {
        buyOrder.amount += remBuy
      }

      if (remSell > 0 && (remSell < this._getMinOrderAmount() || lastStep)) {
        sellOrder.amount -= remSell
      }

      // Push valid orders
      if (!this._orderBelowMin(buyOrder)) {
        orders.push(buyOrder)
        remainingBuyAmount -= buyOrder.amount

        this.D('step %d/%d buy %f @ %f', i + 1, steps, buyOrder.amount, buyOrder.price)
      }

      if (!this._orderBelowMin(sellOrder)) {
        orders.push(sellOrder)
        remainingSellAmount += sellOrder.amount

        this.D('step %d/%d sell %f @ %f', i + 1, steps, sellOrder.amount, sellOrder.price)
      }
    }

    return orders
  }

  /**
   * @param {Order} o - expects internal last fill amount to be updated
   * @return {Promise} p
   * @private
   */
  _handleOrderFill (o) {
    const fillAmount = o.getLastFillAmount()

    if (fillAmount < 0) {
      this.remainingSellAmount += fillAmount
    } else {
      this.remainingBuyAmount -= fillAmount
    }

    this.emit('fill', o)
    this.emit('persist')

    this.D(
      'filled %f @ %f (remaining: buy %f, sell %f)',
      o.amount, o.price, this.remainingBuyAmount, this.remainingSellAmount
    )

    const min = this._getMinOrderAmount()

    if (this.remainingBuyAmount < min && this.remainingSellAmount < min) {
      this.D('fully filled')
      this.emit('filled')
      this.stop()
    }
  }

  /**
   * Get current 'market' price, null if data is unavailable.
   *
   * @return {number} priceTarget
   */
  getPriceTarget () {
    return !isNaN(this.priceTarget)
      ? this.priceTarget
      : this.midPrice
  }
}

const priceTargets = ['OB_MID']
MarketMakerOrder.PRICE_TARGET = {}
priceTargets.forEach(t => { MarketMakerOrder.PRICE_TARGET[t] = t })

MarketMakerOrder._ui = UI
MarketMakerOrder._name = 'ao_market_maker'
MarketMakerOrder._uiName = 'Market Maker'

module.exports = MarketMakerOrder
