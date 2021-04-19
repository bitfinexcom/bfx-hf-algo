'use strict'

const genCID = require('../../util/gen_client_id')
const { Order } = require('bfx-api-node-models')
const _isEmpty = require('lodash/isEmpty')
const { getPings } = require('../util/ping_pong_table')

/**
 * Generates and submits initial `ping` orders, along with any `pongs` that
 * need to be submitted due to the loaded execution state.
 *
 * @memberOf module:PingPong
 * @listens AOHost~lifeStart
 *
 * @param {AOInstance} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onLifeStart = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { emit, debug } = h
  const { args = {}, gid, pingPongTable, activePongs } = state
  const {
    pingAmount, pongAmount, symbol, hidden, lev, _margin, _futures
  } = args

  const sharedOrderParams = {
    meta: { _HF: 1 },
    symbol,
    hidden,
    gid
  }

  if (_futures) {
    sharedOrderParams.lev = lev
  }

  const pingPrices = getPings(pingPongTable)
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
  await emit('exec:order:submit:all', gid, orders, 0)

  if (_isEmpty(activePongs)) {
    return
  }

  // Handle saved pongs
  const pongOrders = getPings(activePongs).map(price => (
    new Order({
      ...sharedOrderParams,

      price,
      cid: genCID(),
      type: _margin || _futures ? Order.type.LIMIT : Order.type.EXCHANGE_LIMIT,
      amount: -pongAmount
    })
  ))

  debug('submitting pong orders: [%j]', getPings(activePongs))
  await emit('exec:order:submit:all', gid, pongOrders, 0)
}

module.exports = onLifeStart
