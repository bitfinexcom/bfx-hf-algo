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

const { API_KEY, API_SECRET, WS_URL, AUTH_TOKEN } = process.env

const wsSettings = {
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  authToken: AUTH_TOKEN,
  dms: 4,
  withHeartbeat: true,
  wsURL: WS_URL // it will point to prod if empty
//  affiliateCode,
}

const host = new AOHost({
  aos: [Iceberg, TWAP, AccumulateDistribute, MACrossover],
  wsSettings,
  signalTracerOpts: {
    enabled: true,
    dir: process.cwd() + '/logs'
  }
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

let gid

host.once('ready', async () => {
  const [serialized] = await host.startAO('bfx-iceberg', {
    excessAsHidden: true,
    orderType: 'LIMIT',
    price: 100,
    amount: 20,
    sliceAmount: 7.5,
    sliceAmountPerc: 0,
    lev: 10,
    action: 'Buy',
    _symbol: 'tAAABBB',
    _margin: false,
    _futures: false,
    meta: { scope: 'web' }
  })

  gid = serialized.gid

  debug('started AO %s', gid)
  await AlgoOrder.set(serialized)
})

host.connect()

process.on('SIGINT', async () => {
  if (gid in host.instances) {
    await host.stopAO(gid)
  }

  setTimeout(async () => {
    await host.close()
    process.exit(0)
  }, 5000)
})
