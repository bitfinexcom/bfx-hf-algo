'use strict'

const { Order } = require('bfx-api-node-models')
const { nonce } = require('bfx-api-node-util')

module.exports = (instance = {}) => {
  const { state = {} } = instance
  const { args = {} } = state
  const {
    ocoAmount, symbol, limitPrice, stopPrice, hidden, postonly, lev,
    _margin, _futures
  } = args

  const cid = nonce()
  const sharedOrderParams = {
    symbol,
    amount: ocoAmount
  }

  if (_futures) {
    sharedOrderParams.lev = lev
  }

  const o = new Order({
    ...sharedOrderParams,
    price: +limitPrice,
    priceAuxLimit: +stopPrice,
    oco: true,
    cid: cid,
    cidOCO: cid,
    type: _margin || _futures ? 'LIMIT' : 'EXCHANGE LIMIT',
    hidden,
    postonly
  })

  console.log(JSON.stringify(o.toNewOrderPacket(), null, 2))

  return o
}
