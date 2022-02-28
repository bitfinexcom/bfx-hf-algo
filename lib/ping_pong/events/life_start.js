'use strict'

const genCID = require('../../util/gen_client_id')
const { Order } = require('bfx-api-node-models')
const _isEmpty = require('lodash/isEmpty')
const { getKeys } = require('../util/ping_pong_table')
const { StartSignal, OrderSignal } = require('bfx-hf-signals/lib/types')

/**
 * Generates and submits initial `ping` orders, along with any `pongs` that
 * need to be submitted due to the loaded execution state.
 *
 * @memberOf module:PingPong
 * @listens AOHost~lifeStart
 *
 * @param {AOInstance} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onLifeStart = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { emit, debug, tracer } = h
  const { args = {}, gid, pingPongTable, activePongs } = state
  const {
    pingAmount, pongAmount, symbol, hidden, visibleOnHit, lev, _margin, _futures, meta = {}
  } = args

  const startSignal = tracer.collect(new StartSignal({ args, activePongs }))

  const sharedOrderParams = {
    symbol,
    hidden,
    visibleOnHit,
    gid
  }

  if (_futures) {
    sharedOrderParams.lev = lev
  }

  const pingPrices = getKeys(pingPongTable)
  const orders = pingPrices.map(price => (
    new Order({
      ...sharedOrderParams,
      price,
      cid: genCID(),
      type: _margin || _futures ? Order.type.LIMIT : Order.type.EXCHANGE_LIMIT,
      amount: pingAmount,
      meta: { ...meta, ping: 1 }
    })
  ))

  orders.forEach(order => {
    tracer.collect(new OrderSignal(order, startSignal))
  })

  debug('submitting ping orders: [%j]', pingPrices)
  await emit('exec:order:submit:all', gid, orders, 0)

  if (_isEmpty(activePongs)) {
    return
  }

  // Handle saved pongs
  const pongOrders = getKeys(activePongs).map(price => (
    new Order({
      ...sharedOrderParams,
      price,
      cid: genCID(),
      type: _margin || _futures ? Order.type.LIMIT : Order.type.EXCHANGE_LIMIT,
      amount: -pongAmount,
      meta: { ...meta, pong: 1 }
    })
  ))

  pongOrders.forEach(order => {
    tracer.collect(new OrderSignal(order, startSignal))
  })

  debug('submitting pong orders: [%j]', getKeys(activePongs))
  await emit('exec:order:submit:all', gid, pongOrders, 0)
}

module.exports = onLifeStart
