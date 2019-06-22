'use strict'

const { Order } = require('bfx-api-node-models')
const { nonce } = require('bfx-api-node-util')
const genPingPongTableForBBands = require('../util/gen_ping_pong_table_for_bbands')

module.exports = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { args = {}, gid } = state
  const { symbol, hidden, pingAmount, _margin, submitDelay } = args
  const { emit, emitSelf, debug, updateState } = h

  const pingPongTable = genPingPongTableForBBands(state)

  await updateState(instance, { pingPongTable })

  const pingPrices = Object.keys(pingPongTable)
  const orders = pingPrices.map(price => (
    new Order({
      symbol,
      price,
      cid: nonce(),
      gid,
      type: _margin ? Order.type.LIMIT : Order.type.EXCHANGE_LIMIT,
      amount: pingAmount,
      hidden
    })
  ))

  debug('submitting ping orders: [%j]', pingPrices)
  await emit('exec:order:submit:all', gid, orders, submitDelay)
}
