'use strict'

const _isEmpty = require('lodash/isEmpty')
const _isFinite = require('lodash/isFinite')
const { nBN } = require('@bitfinex/lib-js-util-math')
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
  const { orders = {}, args = {}, gid, shutdown, isBookUpdated } = state
  const { emit, debug, timeout, updateState, emitSelf } = h
  const {
    priceTarget, tradeBeyondEnd, amount, sliceAmount, cancelDelay, submitDelay, priceDelta,
    orderType, sliceInterval
  } = args
  const isMarketOrder = /MARKET/.test(orderType)

  async function scheduleTick () {
    debug('scheduling interval (%f s)', sliceInterval / 1000)
    const [id, t] = timeout(sliceInterval)
    await updateState(instance, { timeout: id })
    await t()
    await emitSelf('interval_tick')
  }

  debug('tick')

  if (shutdown) {
    return
  }

  if (!isMarketOrder && !isBookUpdated) {
    scheduleTick()
    return
  }

  if (!isMarketOrder && !tradeBeyondEnd && !_isEmpty(orders)) {
    const [, t] = timeout(cancelDelay)
    await t()
    await updateState(instance, { isBookUpdated: false })
    await emit('exec:order:cancel:all', gid, orders, 0)
    scheduleTick()
    return
  }

  if (tradeBeyondEnd) {
    let openAmount = 0

    Object.values(orders).forEach(o => { openAmount = nBN(openAmount).plus(o.amount).toNumber() })

    const currentSumAmount = nBN(openAmount).plus(sliceAmount).toNumber()

    if (
      (amount > 0 && (currentSumAmount > amount)) ||
      (amount < 0 && (currentSumAmount < amount))
    ) {
      debug('next tick would exceed total order amount, refusing')
      return
    }
  }

  if (submitDelay) {
    const [, t] = timeout(submitDelay)
    await t()
  }

  let orderPrice

  if (!isMarketOrder) {
    if (hasTradeTarget(args)) {
      orderPrice = getTradePrice(state)
    } else if (hasOBTarget(args)) {
      orderPrice = getOBPrice(state)
    }

    if (!_isFinite(orderPrice)) {
      debug('price data unavailable, awaiting next tick')
      scheduleTick()
      return
    }

    if (_isFinite(priceTarget)) {
      const targetMet = isTargetMet(args, orderPrice)

      if (!targetMet) {
        debug(
          'target not met | price %f (target %s delta %f)',
          orderPrice, priceTarget, priceDelta
        )
        scheduleTick()
        return
      }
    }

    debug('target met | price %f (target %s)', orderPrice, priceTarget)
  }

  const order = generateOrder(state, orderPrice)
  if (order) {
    await emit('exec:order:submit:all', gid, [order], 0)
  }

  scheduleTick()
}

module.exports = onSelfIntervalTick
