'use strict'

require('dotenv').config()

process.env.DEBUG = '*,-bfx:api:ws:on_channel_message'

const debug = require('debug')('bfx:ao:examples:ao-host')
const AOHost = require('./ao_host')
const Iceberg = require('./iceberg')
const TWAP = require('./twap')
const AccumulateDistribute = require('./accumulate_distribute')

const {
  WS_URL, REST_URL, API_KEY, API_SECRET
} = process.env

const host = new AOHost({
  aos: [Iceberg, TWAP, AccumulateDistribute],
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  wsURL: WS_URL,
  restURL: REST_URL
})

host.on('ao:start', (instance) => {
  const { state = {} } = instance
  const { id, gid } = state
  debug('started AO %s [gid %s]', id, gid)
})

host.on('ao:stop', (instance) => {
  const { state = {} } = instance
  const { id, gid } = state
  debug('stopped AO %s [gid %s]', id, gid)
})

host.on('ws2:auth:error', (packet) => {
  debug('error authenticating: %j', packet)
})

host.on('error', (err) => {
  debug('error: %s', err)
})

host.once('ws2:auth:success', async () => {
  const gid = await host.startAO('bfx-accumulate_distribute', {
    symbol: 'tBTCUSD',
    amount: -0.2,
    sliceAmount: -0.1,
    sliceInterval: 10000,
    intervalDistortion: 0.20,
    amountDistortion: 0.20,
    orderType: 'RELATIVE', // MARKET, LIMIT, RELATIVE
    offsetType: 'ask',
    offsetDelta: -10,
    capType: 'bid',
    capDelta: 10,
    submitDelay: 150,
    cancelDelay: 150,
    catchUp: true, // if true & behind, ignore slice interval (after prev fill)
    awaitFill: true,
    _margin: false
  })

  debug('started AO %s', gid)
})

host.connect()
