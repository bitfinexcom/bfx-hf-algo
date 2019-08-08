'use strict'

const genCID = require('../../util/gen_client_id')
const { Order } = require('bfx-api-node-models')
const genPingPongTable = require('../util/gen_ping_pong_table')

module.exports = (args = {}) => {
  const { endless, hidden, pingAmount, pongAmount, symbol, _margin } = args
  const pingPongTable = genPingPongTable(args)
  const pings = Object.keys(pingPongTable)
  const pongs = pings.map(price => pingPongTable[price])
  const orders = []

  pings.forEach(price => {
    orders.push(new Order({
      symbol,
      price,
      cid: genCID(),
      type: _margin ? Order.type.LIMIT : Order.type.EXCHANGE_LIMIT,
      amount: pingAmount,
      hidden
    }))
  })

  orders.push({ label: 'PONGS FOLLOW' })

  pongs.forEach(price => {
    orders.push(new Order({
      symbol,
      price,
      cid: genCID(),
      type: _margin ? Order.type.LIMIT : Order.type.EXCHANGE_LIMIT,
      amount: -pongAmount,
      hidden
    }))
  })

  if (endless) {
    orders.push({ label: 'REPEATS ENDLESSLY' })
  }

  return orders
}
