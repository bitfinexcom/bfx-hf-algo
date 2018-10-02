'use strict'

const _isEmpty = require('lodash/isEmpty')
const _isFinite = require('lodash/isFinite')
const hasTradeTarget = require('../util/has_trade_target')
const hasOBTarget = require('../util/has_ob_target')
const generateOrder = require('../util/generate_order')
const getOBPrice = require('../util/get_ob_price')
const getTradePrice = require('../util/get_trade_price')
const isTargetMet = require('../util/is_target_met')

module.exports = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { orders = {}, args = {}, gid } = state
  const { emit, debug } = h
  const {
    priceTarget, tradeBeyondEnd, cancelDelay, submitDelay, priceDelta
  } = args

  if (!tradeBeyondEnd && !_isEmpty(orders)) {
    await emit('exec:order:cancel:all', gid, orders, cancelDelay)
  }

  let orderPrice = null

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
      debug('tick | target not met | last price %f (target %s delta %f)', orderPrice, priceTarget, priceDelta)
      return
    }
  }

  debug('tick | target met | last price %f (target %s)', orderPrice, priceTarget)

  const order = generateOrder(state, orderPrice)

  if (order) {
    await emit('exec:order:submit:all', gid, [order], submitDelay)
  }
}
