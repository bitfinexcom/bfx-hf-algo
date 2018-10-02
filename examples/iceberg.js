'use strict'

process.env.DEBUG = 'hf-algo:*'

const bfx = require('./bfx')
const { IcebergOrder } = require('../')

const rest = bfx.rest(2)
const ws = bfx.ws(2)

ws.on('error', (err) => {
  console.error(err)
})

ws.once('open', ws.auth.bind(ws))
ws.once('auth', () => {
  const o = new IcebergOrder(ws, rest, {
    symbol: 'tBTCUSD',
    orderType: 'EXCHANGE LIMIT',
    price: 588.99,
    amount: 1,
    sliceAmount: 0.1,
    excessAsHidden: true
  })

  o.start().catch((err) => {
    console.error(err)
  })
})

ws.open()
