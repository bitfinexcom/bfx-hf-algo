'use strict'

const ApiMock = require('../../util/mimic/bitfinex_api_mock')
const { Candle } = require('bfx-api-node-models')
const Randomizer = require('../../util/randomizer')
const { candles: candlesDataProvider } = require('../../util/mimic/data-providers')
const authHandler = require('../../util/mimic/handlers/auth')
const pingHandler = require('../../util/mimic/handlers/ping')
const subscribeToChannelHandler = require('../../util/mimic/handlers/subscribe_to_channel')
const newOrderHandler = require('../../util/mimic/handlers/new_order')
const unsubscribeHandler = require('../../util/mimic/handlers/unsubscribe')
const { NEW_ORDER } = require('../../util/mimic/signal_types')

function createApiMock () {
  const seed = 59
  const randomizer = new Randomizer(seed)
  const baseCandle = new Candle({
    mts: 0,
    open: 12_000,
    close: 15_000,
    high: 16_000,
    low: 9_000,
    volume: 3
  })
  const dataProviders = {
    candles: candlesDataProvider(randomizer.fork(), baseCandle.serialize())
  }
  const apiMock = new ApiMock({
    server: {
      port: process.env.MOCK_PORT
    },
    session: {
      eventHandlers: {
        auth: authHandler(() => true, 10),
        ping: pingHandler,
        subscribe: subscribeToChannelHandler(dataProviders),
        unsubscribe: unsubscribeHandler,
        [NEW_ORDER]: newOrderHandler
      }
    }
  })

  return apiMock
}

if (process.argv[2] === 'spawn') {
  createApiMock()
  console.log('Mock API spawned')
}

module.exports = {
  createApiMock
}
