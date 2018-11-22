'use strict'

const { Order } = require('bfx-api-node-models')
const { nonce } = require('bfx-api-node-util')
const { Config } = require('bfx-api-node-core')
const { DUST } = Config

module.exports = async (instance = {}, order) => {
  const { state = {}, h = {} } = instance
  const { args = {}, gid, pingPongTable, activePongs } = state
  const { emit, debug, updateState } = h
  const { price } = order
  const {
    endless, submitDelay, symbol, pingAmount, pongAmount, hidden, _margin
  } = args

  if (order.amount > DUST) { // not fully filled
    return
  }

  const {
    [price]: pongPrice,
    ...nextPingPongTable
  } = pingPongTable

  if (!pongPrice) {
    const {
      [price]: pingPrice,
      ...nextActivePongs
    } = activePongs

    if (pingPrice) {
      debug('pong filled: %f', price)

      // NOTE: Shadows from above
      const nextPingPongTable = !endless
        ? pingPongTable
        : {
          ...pingPongTable,
          [pingPrice]: price,
        }

      await updateState(instance, {
        activePongs: nextActivePongs,
        pingPongTable: nextPingPongTable
      })

      if (endless) {
        const pingOrder = new Order({
          symbol,
          price: pingPrice,
          cid: nonce(),
          gid,
          type: _margin ? Order.type.LIMIT : Order.type.EXCHANGE_LIMIT,
          amount: pingAmount,
          hidden,
        })

        await emit('exec:order:submit:all', gid, [pingOrder], submitDelay)

      } else if (
        Object.keys(pingPongTable).length === 0 &&
        Object.keys(nextActivePongs).length === 0
      ) {
        debug('all orders filled')
        await emit('exec:stop')
      }
    }

    return
  }

  const pongOrder = new Order({
    symbol,
    price: pongPrice,
    cid: nonce(),
    gid,
    type: _margin ? Order.type.LIMIT : Order.type.EXCHANGE_LIMIT,
    amount: -pongAmount,
    hidden,
  })

  debug('submitting pong order %f for ping %f', pongPrice, price)

  await emit('exec:order:submit:all', gid, [pongOrder], submitDelay)
  await updateState(instance, {
    pingPongTable: nextPingPongTable,
    activePongs: {
      ...activePongs,
      [pongPrice]: price
    }
  })
}
