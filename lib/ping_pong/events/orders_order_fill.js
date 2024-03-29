'use strict'

const { Order } = require('bfx-api-node-models')
const genCID = require('../../util/gen_client_id')
const { Config } = require('bfx-api-node-core')
const { DUST } = Config
const { extract } = require('../util/ping_pong_table')
const { OrderFilledSignal, OrderSignal } = require('bfx-hf-signals/lib/types')

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
  const { emit, debug, updateState, tracer } = h
  const { price } = order
  const {
    endless, symbol, pingAmount, pongAmount, hidden, visibleOnHit, lev,
    _margin, _futures, meta = {}
  } = args

  const fillSignal = tracer.collect(new OrderFilledSignal(order))

  if (Math.abs(order.amount) > DUST) { // not fully filled
    fillSignal.meta.fullyFilled = false
    return
  }

  const sharedOrderParams = {
    symbol,
    hidden,
    visibleOnHit,
    gid
  }

  if (_futures) {
    sharedOrderParams.lev = lev
  }

  const [pongPrice, nextPingPongTable] = extract(pingPongTable, price)

  if (!pongPrice) {
    const [pingPrice, nextActivePongs] = extract(activePongs, price)

    if (pingPrice) {
      debug('pong filled: %f', price)

      // NOTE: Shadows from above
      const nextPingPongTable = !endless
        ? pingPongTable
        : [
            ...pingPongTable,
            [pingPrice, price]
          ]

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
          amount: pingAmount,
          meta: { ...meta, ping: 1 }
        })

        tracer.collect(new OrderSignal(pingOrder, fillSignal))

        await emit('exec:order:submit:all', gid, [pingOrder], 0)
      } else if (
        Object.keys(pingPongTable).length === 0 &&
        Object.keys(nextActivePongs).length === 0
      ) {
        fillSignal.meta.allOrdersFilled = true
        debug('all orders filled')
        await emit('exec:stop', null, { origin: fillSignal })
      }
    }

    return
  }

  const pongOrder = new Order({
    ...sharedOrderParams,
    price: pongPrice,
    cid: genCID(),
    type: _margin || _futures ? Order.type.LIMIT : Order.type.EXCHANGE_LIMIT,
    amount: -pongAmount,
    meta: { ...meta, pong: 1 }
  })

  debug('submitting pong order %f for ping %f', pongPrice, price)

  tracer.collect(new OrderSignal(pongOrder, fillSignal))

  await emit('exec:order:submit:all', gid, [pongOrder], 0)
  await updateState(instance, {
    pingPongTable: nextPingPongTable,
    activePongs: [
      ...activePongs,
      [pongPrice, price]
    ]
  })
}

module.exports = onOrdersOrderFill
