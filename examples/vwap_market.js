'use strict'

process.env.DEBUG = 'hf-algo:*'

const bfx = require('./bfx')
const { VWAPOrder } = require('../')

const rest = bfx.rest(2)
const ws = bfx.ws(2, {
  manageCandles: true
})

ws.once('open', ws.auth.bind(ws))
ws.once('auth', () => {
  const o = new VWAPOrder(ws, rest, {
    symbol: 'tBTCUSD',
    orderType: 'EXCHANGE LIMIT',
    priceTarget: VWAPOrder.PRICE_TARGET.OB_SIDE,
    tradeBeyondEnd: false,
    amount: -0.85,
    sliceInterval: 5000,
    weights: [1, 1, 5, 2]
  })

  o.start()
})

ws.once('error', (err) => {
  console.error(err)
})

ws.open()
