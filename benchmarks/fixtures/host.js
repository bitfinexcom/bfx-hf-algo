'use strict'

const {
  AOHost, PingPong, Iceberg, TWAP, AccumulateDistribute, MACrossover
} = require('../..')

const { API_KEY, API_SECRET } = process.env

if (!API_KEY || !API_SECRET) throw new Error('API_KEY and API_SECRET are required')

function spawnHost () {
  const wsSettings = {
    apiKey: API_KEY,
    apiSecret: API_SECRET,
    dms: 4
  }
  const host = new AOHost({
    aos: [PingPong, Iceberg, TWAP, AccumulateDistribute, MACrossover],
    wsSettings
  })

  host.on('ao:start', (instance) => {
    const { state = {} } = instance
    const { id, gid } = state
    console.log('started AO %s [gid %s]', id, gid)
  })

  host.on('ao:stop', (instance) => {
    const { state = {} } = instance
    const { id, gid } = state
    console.log('stopped AO %s [gid %s]', id, gid)
  })

  host.on('auth:error', (packet) => {
    console.log('error authenticating: %j', packet)
  })

  host.on('error', (err) => {
    console.log('error: %s', err)
  })

  return host
}

function connectHost (host) {
  return new Promise((resolve, reject) => {
    host.connect()

    host.once('error', (err) => {
      reject(err)
    })
    host.once('ready', async () => {
      resolve()
    })
  })
}

function destroyHost (host) {
  host.removeAllListeners()
  host.close()
  host.cleanState()
}

module.exports = {
  spawnHost,
  connectHost,
  destroyHost
}
