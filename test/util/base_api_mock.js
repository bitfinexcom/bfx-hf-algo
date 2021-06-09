'use strict'

const { Candle } = require('bfx-api-node-models')

const Randomizer = require('./randomizer')
const ApiMock = require('./mimic/bitfinex_api_mock')
const { candles: candlesDataProvider } = require('./mimic/data-providers')
const authHandler = require('./mimic/handlers/auth')
const pingHandler = require('./mimic/handlers/ping')
const subscribeToChannelHandler = require('./mimic/handlers/subscribe_to_channel')
const newOrderHandler = require('./mimic/handlers/new_order')
const unsubscribeHandler = require('./mimic/handlers/unsubscribe')
const { NEW_ORDER } = require('./mimic/signal_types')

class BaseApiMock extends ApiMock {
  constructor (props = {}) {
    super({
      ...props,
      session: {
        ...(props.session || {}),
        eventHandlers: {
          auth: authHandler(event => event.apiKey === props.apiKey),
          ping: pingHandler,
          subscribe: subscribeToChannelHandler(props.dataProviders),
          unsubscribe: unsubscribeHandler,
          [NEW_ORDER]: newOrderHandler,
          ...((props.session && props.session.eventHandlers) || {})
        }
      }
    })
  }

  static getDataProviders () {
    const baseCandle = new Candle({
      mts: 0,
      open: 12_000,
      close: 15_000,
      high: 16_000,
      low: 9_000,
      volume: 3
    })
    const seed = 59
    const randomizer = new Randomizer(seed)

    return {
      candles: candlesDataProvider(randomizer.fork(), baseCandle.serialize())
    }
  }
}

module.exports = BaseApiMock
