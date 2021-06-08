'use strict'

const {
  AOHost, PingPong, Iceberg, TWAP, AccumulateDistribute, MACrossover
} = require('../..')

function spawnHost ({ apiKey, apiSecret, wsURL }) {
  if (!apiKey || !apiSecret) throw new Error('API_KEY and API_SECRET are required')

  const wsSettings = {
    apiKey,
    apiSecret,
    wsURL,
    dms: 4
  }
  const host = new AOHost({
    aos: [PingPong, Iceberg, TWAP, AccumulateDistribute, MACrossover],
    wsSettings
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
