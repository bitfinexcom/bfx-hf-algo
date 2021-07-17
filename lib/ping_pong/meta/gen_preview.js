'use strict'

const genCID = require('../../util/gen_client_id')
const { Order } = require('bfx-api-node-models')
const genPingPongTable = require('../util/gen_ping_pong_table')
const { getKeys, getValues } = require('../util/ping_pong_table')

/**
 * Generates an array of preview orders which show what could be expected if
 * an instance of PingPong was executed with the specified parameters.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:PingPong
 * @param {object} args - instance parameters
 * @returns {object[]} previewOrders
 */
const genPreview = (args = {}) => {
  const { endless, hidden, pingAmount, pongAmount, symbol, _margin } = args
  const pingPongTable = genPingPongTable(args)
  const pings = getKeys(pingPongTable)
  const pongs = getValues(pingPongTable)
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

module.exports = genPreview
