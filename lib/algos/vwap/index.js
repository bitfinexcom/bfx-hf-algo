'use strict'

const TWAPOrder = require('../twap')
const UI = {}

/**
 * Volume-Weighted Average Price Order
 *
 * Extends TWAP and replaces `sliceAmount` with a series of `weights`, which are
 * used to calculate the amount bought/sold in each interval.
 *
 * @see TWAPOrder (twap.js)
 * @extends TWAPOrder
 */
class VWAPOrder extends TWAPOrder {
  /**
   * Create a new VWAP order
   *
   * @param {WSv2} ws
   * @param {RESTv2} rest
   * @param {Object} args
   * @param {string?} args.algoName - defaults to 'vwap'
   * @param {number?} args.gid - atomic order group ID
   * @param {string} args.symbol - symbol to trade
   * @param {number} args.amount - total order size
   * @param {number[]} args.weights - array of weights to be used to calculate the slice amount
   * @param {number} args.sliceInterval - duration over which to trade slice
   * @param {number|string} args.priceTarget - numeric or market target
   * @param {string?} args.priceCondition - how to match numeric price target
   * @param {string} args.orderType - set directly on atomic orders
   * @param {boolean?} args.tradeBeyondEnd - if true, unfilled orders are not cancelled
   * @param {Object[]?} args.channels - optional extra channels to sub to
   * @param {function(Object):Object?} args.orderModifier - can be used to modify orders before sending
   */
  constructor (ws, rest, args) {
    if (!args.algoName) args.algoName = VWAPOrder._name
    if (!args.uiName) args.uiName = VWAPOrder._uiName
    if (!args.weights || !args.weights.length) throw new Error('Weights required')

    args.sliceAmount = 0 // TWAP constructor expects this, but it is ignored

    super(ws, rest, args, VWAPOrder._ui)

    this.weights = args.weights
    this.weightSum = 0

    this.weights.forEach(w => { this.weightSum += +w })
  }

  /**
   * @return {number} w
   * @private
   */
  _getCurrentWeight () {
    const intervalI = this._getCurrentInterval()

    // Note that intervalI may be past our weights if tradeBeyondEnd
    return this.weights[Math.min(this.weights.length - 1, intervalI)]
  }

  /**
   * @return {number} f
   * @private
   */
  _getCurrentWeightFactor () {
    return this._getCurrentWeight() / this.weightSum
  }

  /**
   * @return {number} amount
   * @private
   */
  _getCurrentAmount () {
    return this.amount * this._getCurrentWeightFactor()
  }
}

VWAPOrder.PRICE_COND = TWAPOrder.PRICE_COND
VWAPOrder.PRICE_TARGET = TWAPOrder.PRICE_TARGET
VWAPOrder._ui = UI
VWAPOrder._name = 'ao_vwap'
VWAPOrder._uiName = 'VWAP'

module.exports = VWAPOrder
