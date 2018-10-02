'use strict'

process.env.DEBUG = 'hf-algo:*'

const bfx = require('./bfx')
const { TWAPOrder } = require('../')

const rest = bfx.rest(2)
const ws = bfx.ws(2)

ws.once('open', ws.auth.bind(ws))
ws.once('auth', () => {
  const o = new TWAPOrder(ws, rest, {
    symbol: 'tBTCUSD',
    orderType: 'EXCHANGE LIMIT',
    priceTarget: TWAPOrder.PRICE_TARGET.OB_SIDE,
    tradeBeyondEnd: false,
    amount: -1,
    sliceAmount: -0.2,
    sliceInterval: 5000
  })

  o.start()
})

ws.open()
