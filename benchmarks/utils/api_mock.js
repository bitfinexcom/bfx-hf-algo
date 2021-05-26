
const ApiMock = require('../../test/util/mimic/bitfinex_api_mock')
const { Candle } = require('bfx-api-node-models')
const Randomizer = require('../../test/util/randomizer')
const { candles: candlesDataProvider } = require('../../test/util/mimic/data-providers')
const authHandler = require('../../test/util/mimic/handlers/auth')
const pingHandler = require('../../test/util/mimic/handlers/ping')
const subscribeToChannelHandler = require('../../test/util/mimic/handlers/subscribe_to_channel')
const newOrderHandler = require('../../test/util/mimic/handlers/new_order')
const unsubscribeHandler = require('../../test/util/mimic/handlers/unsubscribe')
const { NEW_ORDER } = require('../../test/util/mimic/signal_types')

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
    port: 5555
  },
  session: {
    eventHandlers: {
      auth: authHandler(() => true),
      ping: pingHandler,
      subscribe: subscribeToChannelHandler(dataProviders),
      unsubscribe: unsubscribeHandler,
      [NEW_ORDER]: newOrderHandler
    }
  }
});

console.log('apiMock: ', apiMock.url())
