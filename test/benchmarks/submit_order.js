'use strict'

const { setupBenchmark } = require('./utils/setup')
const { spawnHost, connectHost } = require('../util/host')
const { performOrder } = require('./fixtures/orders')

const apiKey = 'api key'
const apiSecret = 'api secret'

const host = spawnHost({ apiKey, apiSecret, wsURL: process.env.API_URL })
const connectPromise = connectHost(host)

setupBenchmark(async () => {
  await connectPromise
  const id = await performOrder(host)
  await host.stopAO(id)
})
