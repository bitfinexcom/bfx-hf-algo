'use strict'

const restify = require('restify')

function setupBenchmark (execute) {
  const server = restify.createServer()

  server.get('/', async (req, res, next) => {
    res.send(await execute() || null)
    next()
  })

  server.listen(3000)

  process.on('SIGINT', function () {
    console.error('Caught SIGINT, shutting down.')
    server.close()
    process.exit(0)
  })
}

module.exports = {
  setupBenchmark
}
