'use strict'

const { nonce } = require('bfx-api-node-util')
const { Order } = require('bfx-api-node-models')
const genPingPongTable = require('../util/gen_ping_pong_table')

module.exports = (args = {}) => {
  const { hidden, amount, symbol, _margin } = args
  const pingPongTable = genPingPongTable(args)
  const pings = Object.keys(pingPongTable)
  const pongs = pings.map(price => pingPongTable[price])
  const orders = []

  pings.forEach(price => {
    orders.push(new Order({
      symbol,
      price,
      cid: nonce(),
      type: _margin ? Order.type.LIMIT : Order.type.EXCHANGE_LIMIT,
      amount,
      hidden,
    }))
  })

  pongs.forEach(price => {
    orders.push(new Order({
      symbol,
      price,
      cid: nonce(),
      type: _margin ? Order.type.LIMIT : Order.type.EXCHANGE_LIMIT,
      amount: -amount,
      hidden,
    }))
  })

  return orders
}
