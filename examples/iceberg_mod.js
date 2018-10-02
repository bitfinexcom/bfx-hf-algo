'use strict'

process.env.DEBUG = 'hf-algo:*'

const bfx = require('./bfx')
const { IcebergOrder } = require('../')

const rest = bfx.rest(2)
const ws = bfx.ws(2, {
  manageCandles: true
})

ws.once('open', ws.auth.bind(ws))
ws.once('auth', () => {
  ws.subscribeCandles('trade:30m:tBTCUSD')

  const o = new IcebergOrder(ws, rest, {
    symbol: 'tBTCUSD',
    orderType: 'EXCHANGE LIMIT',
    price: 1165.6,
    amount: 1,
    sliceAmount: 0.1,
    excessAsHidden: true,

    orderModifier: function (o) {
      const candles = ws.getCandles('trade:30m:tBTCUSD')
      const last = candles[0]

      // Candle data may be pending
      if (!last) return null

      // Cap volume at 25% of last 30min candle
      const mul = o.amount < 0 ? -1 : 1
      o.amount = mul * Math.min(Math.abs(o.amount), last[5] * 0.25)

      return o
    }
  })

  o.start()
})

ws.open()
