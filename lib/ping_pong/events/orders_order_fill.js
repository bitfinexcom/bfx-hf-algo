'use strict'

const { Order } = require('bfx-api-node-models')
const { nonce } = require('bfx-api-node-util')
const { Config } = require('bfx-api-node-core')
const { DUST } = Config

module.exports = async (instance = {}, order) => {
  const { state = {}, h = {} } = instance
  const { args = {}, gid, pingPongTable, activePongs } = state
  const { emit, debug, updateState } = h
  const { submitDelay, symbol, amount, hidden, _margin } = args
  const { price } = order

  const {
    [price]: pongPrice,
    ...nextPingPongTable
  } = pingPongTable

  if (!pongPrice) {
    const pongIndex = activePongs.indexOf(price)

    if (pongIndex !== -1) {
      debug('pong filled: %f', price)

      const nextActivePongs = [...activePongs]
      nextActivePongs.splice(pongIndex, 1)

      await updateState(instance, {
        activePongs: nextActivePongs
      })

      if (nextActivePongs.length === 0 && Object.keys(pingPongTable).length === 0) {
        debug('all orders filled')
        await emit('exec:stop')
      }
    }

    return
  }

  if (order.amount > DUST) { // not fully filled
    return
  }

  const pongOrder = new Order({
    symbol,
    price: pongPrice,
    cid: nonce(),
    gid,
    type: _margin ? Order.type.LIMIT : Order.type.EXCHANGE_LIMIT,
    amount: -amount,
    hidden,
  })

  debug('submitting pong order %f for ping %f', pongPrice, price)

  await emit('exec:order:submit:all', gid, [pongOrder], submitDelay)
  await updateState(instance, {
    pingPongTable: nextPingPongTable,
    activePongs: [
      ...activePongs,
      pongPrice
    ]
  })
}
