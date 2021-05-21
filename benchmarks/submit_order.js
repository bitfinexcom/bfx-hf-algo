'use strict'

const { setupBenchmark } = require('./utils/setup')
const { spawnHost, connectHost } = require('./fixtures/host')
const { performOrder } = require('./fixtures/orders')

const { API_KEY, API_SECRET } = process.env

const host = spawnHost({ apiKey: API_KEY, apiSecret: API_SECRET })
const connectPromise = connectHost(host)

setupBenchmark(async () => {
  await connectPromise
  await performOrder(host)
})
