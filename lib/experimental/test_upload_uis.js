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
