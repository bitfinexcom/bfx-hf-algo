'use strict'

const { setupBenchmark } = require('./utils/setup')
const { spawnHost, connectHost, destroyHost } = require('./fixtures/host')

const { API_KEY, API_SECRET } = process.env

setupBenchmark(async () => {
  const host = spawnHost({ apiKey: API_KEY, apiSecret: API_SECRET })

  await connectHost(host)
  await destroyHost(host)
})
