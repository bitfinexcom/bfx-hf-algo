'use strict'

const _isEmpty = require('lodash/isEmpty')
const _isFinite = require('lodash/isFinite')
const { nBN } = require('@bitfinex/lib-js-util-math')
const { types: { OrderSignal, TickSignal, CancelAllSignal } } = require('bfx-hf-signals')

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
 * @param {AoInstance} instance - AO instance
 * @param {Signal?} origin
 * @returns {Promise} p - resolves on completion
 */
const onSelfIntervalTick = async (instance = {}, origin) => {
  const { state = {}, h = {} } = instance
  const { orders = {}, args = {}, gid, shutdown, lastBook } = state
  const { emit, debug, timeout, updateState, emitSelf, tracer } = h
  const {
    priceTarget, tradeBeyondEnd, amount, sliceAmount, priceDelta,
    orderType, sliceInterval
  } = args

  const tickSignal = tracer.collect(new TickSignal(origin, args))

  async function scheduleTick () {
    debug('scheduling interval (%f s)', sliceInterval / 1000)
    const [id, t] = timeout(sliceInterval)
    await updateState(instance, { timeout: id })
    await t()
    await emitSelf('interval_tick', tickSignal)
  }

  debug('tick')

  if (shutdown) {
    return
  }

  const hasOrders = !_isEmpty(orders)

  if (!tradeBeyondEnd && hasOrders) {
    tracer.collect(new CancelAllSignal(tickSignal, { tradeBeyondEnd, hasOrders }))
    await emit('exec:order:cancel:all', gid, orders)
  }

  if (tradeBeyondEnd) {
    let openAmount = 0

    Object.values(orders).forEach(o => { openAmount = nBN(openAmount).plus(o.amount).toNumber() })

    const currentSumAmount = nBN(openAmount).plus(sliceAmount).toNumber()

    if (
      (amount > 0 && (currentSumAmount > amount)) ||
      (amount < 0 && (currentSumAmount < amount))
    ) {
      tickSignal.meta.currentSumAmount = currentSumAmount
      debug('next tick would exceed total order amount, refusing')
      return emit('exec:stop', null, { origin: tickSignal })
    }
  }

  if (instance.state.shutdown) {
    return
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
    if (hasOBTarget(args) && lastBook) {
      await emit('exec:log_algo_data', gid, lastBook.serialize(), `OB_for_order_${order.cid}`)
    }

    tracer.collect(new OrderSignal(order, tickSignal))

    await emit('exec:order:submit:all', gid, [order], 0)
  }

  scheduleTick()
}

module.exports = onSelfIntervalTick
