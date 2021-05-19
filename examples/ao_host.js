'use strict'

const path = require('path')

require('dotenv').config()

process.env.DEBUG = '*,-bfx:api:ws:on_channel_message'

const debug = require('debug')('bfx:hf:algo:examples:ao-host')
const {
  AOHost, Iceberg, TWAP, AccumulateDistribute, MACrossover
} = require('../')

const HFDB = require('bfx-hf-models')
const HFDBLowDBAdapter = require('bfx-hf-models-adapter-lowdb')
const {
  schema: HFDBBitfinexSchema
} = require('bfx-hf-ext-plugin-bitfinex')

const { AlgoOrder } = new HFDB({
  schema: HFDBBitfinexSchema,
  adapter: HFDBLowDBAdapter({
    dbPath: path.join(__dirname, '..', 'db', 'example.json')
  })
})

const { API_KEY, API_SECRET } = process.env

const wsSettings = {
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  dms: 4,
  withHeartbeat: true
//  affiliateCode,
//  wsURL,
//  restURL
}

const host = new AOHost({
  aos: [Iceberg, TWAP, AccumulateDistribute, MACrossover],
  wsSettings
})

host.on('ao:state:update', async (updateOpts) => {
  debug('ao instance updated %s', updateOpts.gid)
  console.log(updateOpts)
})

host.on('auth:error', (packet) => {
  debug('error authenticating: %j', packet)
})

host.on('error', (err) => {
  debug('error: %s', err)
})

host.once('ready', async () => {
  const [serialized] = await host.startAO('bfx-accumulate_distribute', {
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
    catchUp: true, // if true & behind, ignore slice interval (after prev fill)
    awaitFill: true,
    _margin: false
  })

  debug('started AO %s', serialized.gid)
  await AlgoOrder.set(serialized)
})

host.connect()
