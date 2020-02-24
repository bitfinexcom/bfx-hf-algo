'use strict'

const genCID = require('../../util/gen_client_id')
const { Order } = require('bfx-api-node-models')
const _isEmpty = require('lodash/isEmpty')

module.exports = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { emit, debug } = h
  const { args = {}, gid, pingPongTable, activePongs } = state
  const {
    pingAmount, pongAmount, submitDelay, symbol, hidden, lev, _margin, _futures
  } = args

  const sharedOrderParams = {
    symbol,
    hidden,
    gid
  }

  if (_futures) {
    sharedOrderParams.lev = lev
  }

  const pingPrices = Object.keys(pingPongTable)
  const orders = pingPrices.map(price => (
    new Order({
      ...sharedOrderParams,

      price,
      cid: genCID(),
      type: _margin || _futures ? Order.type.LIMIT : Order.type.EXCHANGE_LIMIT,
      amount: pingAmount
    })
  ))

  debug('submitting ping orders: [%j]', pingPrices)
  await emit('exec:order:submit:all', gid, orders, submitDelay)

  if (_isEmpty(activePongs)) {
    return
  }

  // Handle saved pongs
  const pongOrders = Object.keys(activePongs).map(price => (
    new Order({
      ...sharedOrderParams,

      price,
      cid: genCID(),
      type: _margin || _futures ? Order.type.LIMIT : Order.type.EXCHANGE_LIMIT,
      amount: -pongAmount
    })
  ))

  debug('submitting pong orders: [%j]', Object.keys(activePongs))
  await emit('exec:order:submit:all', gid, pongOrders, submitDelay)
}
