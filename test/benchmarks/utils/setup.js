'use strict'

const restify = require('restify')

function setupBenchmark (execute) {
  const server = restify.createServer()

  server.use(restify.plugins.queryParser())

  server.get('/', async (req, res, next) => {
    res.send(await execute() || null)
    next()
  })

  server.get('/gc', async (req, res, next) => {
    if (!global.gc) {
      res.status(500)
      res.send('GC is not available')
      return next()
    }

    const gcIterations = +req.query.iterations
    const gcInterval = +req.query.interval * 1000

    console.log(`Starting GC... wait for ${(gcIterations * gcInterval / 1000 / 60).toFixed('2')} mins`)

    for (let i = 0; i < gcIterations; i++) {
      global.gc()
      await new Promise((resolve) => setTimeout(resolve, gcInterval))
    }
    res.send('GC performed')
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
