'use strict'

const { setupBenchmark } = require('./utils/setup')
const { spawnHost, connectHost, destroyHost } = require('./fixtures/host')

const apiKey = 'api key'
const apiSecret = 'api secret'

setupBenchmark(async () => {
  const host = spawnHost({ apiKey, apiSecret, wsURL: process.env.API_URL })

  await connectHost(host)
  destroyHost(host)
})
