'use strict'

const { setupBenchmark } = require('./utils/setup')
const { spawnHost, connectHost, destroyHost } = require('./fixtures/host')

setupBenchmark(async () => {
  const host = spawnHost()

  await connectHost(host)
  await destroyHost(host)
})
