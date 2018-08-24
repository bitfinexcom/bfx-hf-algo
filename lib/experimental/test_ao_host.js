'use strict'

require('dotenv').config()

process.env.DEBUG = '*'

const debug = require('debug')('bfx:ao:test-ao-host')
const SocksProxyAgent = require('socks-proxy-agent')
const AOHost = require('./ao_host')
const Iceberg = require('./iceberg')

const {
  WS_URL, REST_URL, API_KEY, API_SECRET, SOCKS_PROXY_URL
} = process.env

const host = new AOHost({
  aos: [Iceberg],
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  agent: new SocksProxyAgent(SOCKS_PROXY_URL),
  wsURL: WS_URL,
  restURL: REST_URL,
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

host.once('ws2:auth:success', () => {
  host.startAO('bfx.iceberg', {
    symbol: 'tBTCUSD',
    price: 7000,
    amount: -2,
    sliceAmount: -0.2,
    excessAsHidden: true,
    orderType: 'LIMIT',
    submitDelay: 2000,
    cancelDelay: 2000,
    _margin: false,
  })
})

host.connect()
