'use strict'

const { Order } = require('bfx-api-node-models')
const genCID = require('../../util/gen_client_id')
const { Config } = require('bfx-api-node-core')
const { DUST } = Config

/**
 * Triggered on atomic order fill. If it was a `ping`, the associated `pong`
 * is submitted. Otherwise it if was a `pong` and the instance was configured
 * as `endless`, the associated `ping` is submitted. If not `endless`, nothing
 * is done.
 *
 * @memberOf module:PingPong
 * @listens AOHost~ordersOrderFill
 *
 * @param {AOInstance} instance - AO instance
 * @param {object} order - the order that filled
 * @returns {Promise} p - resolves on completion
 */
const onOrdersOrderFill = async (instance = {}, order) => {
  const { state = {}, h = {} } = instance
  const { args = {}, gid, pingPongTable, activePongs } = state
  const { emit, debug, updateState } = h
  const { price } = order
  const {
    endless, submitDelay, symbol, pingAmount, pongAmount, hidden, lev,
    _margin, _futures
  } = args

  if (order.amount > DUST) { // not fully filled
    return
  }

  const sharedOrderParams = {
    meta: { _HF: 1 },
    symbol,
    hidden,
    gid
  }

  if (_futures) {
    sharedOrderParams.lev = lev
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
          [pingPrice]: price
        }

      await updateState(instance, {
        activePongs: nextActivePongs,
        pingPongTable: nextPingPongTable
      })

      if (endless) {
        const pingOrder = new Order({
          ...sharedOrderParams,

          price: pingPrice,
          cid: genCID(),
          type: _margin || _futures ? Order.type.LIMIT : Order.type.EXCHANGE_LIMIT,
          amount: pingAmount
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
    ...sharedOrderParams,

    price: pongPrice,
    cid: genCID(),
    type: _margin || _futures ? Order.type.LIMIT : Order.type.EXCHANGE_LIMIT,
    amount: -pongAmount
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

module.exports = onOrdersOrderFill
