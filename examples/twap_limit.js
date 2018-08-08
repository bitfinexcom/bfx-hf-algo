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
    priceTarget: 600,
    priceCondition: TWAPOrder.PRICE_COND.MATCH_LAST,
    tradeBeyondEnd: false,
    amount: 2,
    sliceAmount: 0.3,
    sliceInterval: 60000
  })

  o.start()
})

ws.open()
