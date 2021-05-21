'use strict'

const WsMock = require('../util/mocks/ws_mock')

const mockServer = new WsMock({ interval: 10 })
mockServer.start()
  .then(() => console.log('server started'))
  .catch(console.error)
mockServer.onConnection((client) => {
  console.log('new connection')

  client
    .send({ foo: 123 })
    .after(2000, 'ping')
    .after(5000, (instance) => {
      instance.send({ bar: 123 })
    })
    .each(1000, (instance, stop, state) => {
      if (state >= 3) {
        stop()
        return
      }

      instance.send({ baz: 123 })

      return state ? state + 1 : 1
    })
    .after(10000, (instance) => {
      mockServer.close()
    })
    .onMessage((instance, data) => {
      console.log('->', data)
    })
})

console.log('port', mockServer.port())

// You can create a connection directly or by hand using the port
const client = mockServer.connect()
client.on('open', () => {
  console.log('connected')
})
client.on('close', () => {
  console.log('disconnected')
})
client.on('message', (data) => {
  const message = JSON.parse(data)

  if (message === 'ping') {
    client.send('"pong"')
  }

  console.log(message)
})
