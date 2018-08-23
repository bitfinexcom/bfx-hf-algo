'use strict'

process.env.DEBUG = '*'

const debug = require('debug')('bfx:ao:test-ao-host')
const AOHost = require('./ao_host')
const Iceberg = require('./iceberg')

const host = new AOHost({
  aos: [Iceberg],
  apiKey: '...',
  apiSecret: '...',
  agent: null,
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

host.startAO('bfx.iceberg', {
  symbol: 'tBTCUSD',
  price: 7000,
  amount: -2,
  sliceAmount: 0.2,
  orderType: 'LIMIT',
  margin: false,
  submitDelay: 2000,
  cancelDelay: 2000,
})
