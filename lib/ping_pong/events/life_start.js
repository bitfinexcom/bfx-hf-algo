'use strict'

const { nonce } = require('bfx-api-node-util')
const { Order } = require('bfx-api-node-models')
const _isEmpty = require('lodash/isEmpty')

module.exports = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { emit, debug } = h
  const { args = {}, gid, pingPongTable, activePongs } = state
  const { pingAmount, pongAmount, submitDelay, symbol, hidden, _margin } = args

  const pingPrices = Object.keys(pingPongTable)
  const orders = pingPrices.map(price => (
    new Order({
      symbol,
      price,
      cid: nonce(),
      gid,
      type: _margin ? Order.type.LIMIT : Order.type.EXCHANGE_LIMIT,
      amount: pingAmount,
      hidden,
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
      symbol,
      price,
      cid: nonce(),
      gid,
      type: _margin ? Order.type.LIMIT : Order.type.EXCHANGE_LIMIT,
      amount: -pongAmount,
      hidden,
    })
  ))

  debug('submitting pong orders: [%j]', Object.keys(activePongs))
  await emit('exec:order:submit:all', gid, pongOrders, submitDelay)
}
