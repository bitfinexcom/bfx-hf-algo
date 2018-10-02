'use strict'

process.env.DEBUG = 'hf-algo:*'

const bfx = require('./bfx')
const { MarketMakerOrder } = require('../')

const rest = bfx.rest(2)
const ws = bfx.ws(2, { manageOrderBooks: true })

ws.on('error', (err) => {
  console.error(err)
})

ws.once('open', ws.auth.bind(ws))
ws.once('auth', () => {
  const o = new MarketMakerOrder(ws, rest, {
    gid: 42,
    symbol: 'tIOTUSD',
    orderType: 'EXCHANGE LIMIT',
    priceTarget: MarketMakerOrder.PRICE_TARGET.OB_MID,
    sellPriceDPerc: 0.25,

    amount: 1000,
    amountBuy: 300,
    amountDPerc: 0.5,
    amountBuyDPerc: 0.1,

    spreadMin: 0.1,
    spreadMax: 0.4,

    orderCount: 4
  })

  o.start().catch((err) => {
    console.error(err)
  })
})

ws.open()
