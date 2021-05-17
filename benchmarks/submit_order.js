const { setupBenchmark } = require('./utils/setup')
const { spawnHost, connectHost } = require('./fixtures/host')

const { performOrder } = require('./fixtures/orders')
const host = spawnHost()
const connectPromise = connectHost(host)

setupBenchmark(async () => {
  await connectPromise
  await performOrder(host)
})
