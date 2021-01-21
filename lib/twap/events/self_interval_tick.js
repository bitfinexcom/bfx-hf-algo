'use strict'

const _isEmpty = require('lodash/isEmpty')
const _isFinite = require('lodash/isFinite')
const hasTradeTarget = require('../util/has_trade_target')
const hasOBTarget = require('../util/has_ob_target')
const generateOrder = require('../util/generate_order')
const getOBPrice = require('../util/get_ob_price')
const getTradePrice = require('../util/get_trade_price')
const isTargetMet = require('../util/is_target_met')

/**
 * Submits the next slice order if the price condition/target is met.
 *
 * @memberOf module:TWAP
 * @listens module:TWAP~selfIntervalTick
 *
 * @param {AOInstance} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onSelfIntervalTick = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { orders = {}, args = {}, gid } = state
  const { emit, debug, timeout } = h
  const {
    priceTarget, tradeBeyondEnd, cancelDelay, submitDelay, priceDelta,
    orderType, sliceAmount, amount
  } = args

  debug('tick')

  if (!tradeBeyondEnd && !_isEmpty(orders)) {
    await emit('exec:order:cancel:all', gid, orders, cancelDelay)
  }

  // Ensure that the next order would not push us over the total amount
  if (tradeBeyondEnd) {
    let openAmount = 0

    Object.values(orders).forEach(o => { openAmount += o.amount })

    if (
      (amount > 0 && (openAmount + sliceAmount > amount)) ||
      (amount < 0 && (openAmount + sliceAmount < amount))
    ) {
      debug('next tick would exceed total order amount, refusing')
      return
    }
  }

  if (submitDelay) {
    await timeout(submitDelay)
  }

  let orderPrice

  if (!/MARKET/.test(orderType)) {
    if (hasTradeTarget(args)) {
      orderPrice = getTradePrice(state)
    } else if (hasOBTarget(args)) {
      orderPrice = getOBPrice(state)
    }

    if (!_isFinite(orderPrice)) {
      debug('price data unavailable, awaiting next tick')
      return
    }

    if (_isFinite(priceTarget)) {
      const targetMet = isTargetMet(args, orderPrice)

      if (!targetMet) {
        debug(
          'target not met | price %f (target %s delta %f)',
          orderPrice, priceTarget, priceDelta
        )

        return
      }
    }

    debug('target met | price %f (target %s)', orderPrice, priceTarget)
  }

  const order = generateOrder(state, orderPrice)
  if (order) {
    await emit('exec:order:submit:all', gid, [order], 0)
  }
}

module.exports = onSelfIntervalTick
