'use strict'

const { setupBenchmark } = require('./utils/setup')
const { spawnHost, connectHost, destroyHost } = require('./fixtures/host')

const apiKey = 'api key'
const apiSecret = 'api secret'

setupBenchmark(async () => {
  const host = spawnHost({ apiKey, apiSecret, wsURL: 'ws://localhost:5555' })

  await connectHost(host)
  destroyHost(host)
})
