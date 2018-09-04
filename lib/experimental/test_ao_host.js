'use strict'

require('dotenv').config()

process.env.DEBUG = '*,-bfx:api:ws:on_channel_message'

const debug = require('debug')('bfx:ao:test-ao-host')
const SocksProxyAgent = require('socks-proxy-agent')
const AOHost = require('./ao_host')
const Iceberg = require('./iceberg')
const TWAP = require('./twap')
const AccumulateDistribute = require('./accumulate_distribute')

const {
  WS_URL, REST_URL, API_KEY, API_SECRET, SOCKS_PROXY_URL
} = process.env

const host = new AOHost({
  aos: [Iceberg, TWAP, AccumulateDistribute],
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  agent: new SocksProxyAgent(SOCKS_PROXY_URL),
  wsURL: WS_URL,
  restURL: REST_URL
})

// host.registerAO(Iceberg)

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
  // NOTE: Indicator must be seeded
  const gid = await host.startAO('bfx.accumulate_distribute', {
    symbol: 'tBTCUSD',
    amount: -0.2,
    sliceAmount: -0.1,
    sliceInterval: 10000,
    intervalDistortion: 0.20,
    amountDistortion: 0.20,
    orderType: 'RELATIVE', // MARKET, LIMIT, RELATIVE
    // limitPrice: 20000,
    relativeOffset: { type: 'ask', args: [20], delta: -10 },
    relativeCap: { type: 'bid', delta: 10 },
    candlePrice: 'close',
    candleTimeFrame: '1h',
    submitDelay: 150,
    cancelDelay: 150,
    // startTime: Date.now(),
    // endTime: Date.now() + (24 * 60 * 60 * 1000)
    catchUp: true, // if true & behind, ignore slice interval (after prev fill)
    awaitFill: true,
    _margin: false,
  })

  /*
  const gid = await host.startAO('bfx.twap', {
    symbol: 'tBTCUSD',
    amount: -0.5,
    sliceAmount: -0.1,
    sliceInterval: 10,
    priceDelta: 100,
    priceTarget: 16650,
    priceCondition: TWAP.Config.PRICE_COND.MATCH_LAST,
    tradeBeyondEnd: false,
    orderType: 'LIMIT',
    submitDelay: 150,
    cancelDelay: 150,
    _margin: false
  })
  */

  debug('started AO %s', gid)

  /*
  const gid = host.startAO('bfx.iceberg', {
    symbol: 'tBTCUSD',
    price: 21000,
    amount: -0.5,
    sliceAmount: -0.1,
    excessAsHidden: true,
    orderType: 'LIMIT',
    submitDelay: 150,
    cancelDelay: 150,
    _margin: false,
  })
  */
})

host.connect()
