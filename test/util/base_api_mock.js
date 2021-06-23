'use strict'

const { Candle, PublicTrade, OrderBook } = require('bfx-api-node-models')

const Randomizer = require('./randomizer')
const ApiMock = require('./mimic/bitfinex_api_mock')
const { candles: candlesDataProvider, trades: tradesDataProvider, book: bookDataProvider } = require('./mimic/data-providers')
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
    const baseTrade = new PublicTrade({ price: 5000, amount: 9001 })
    const baseBook = new OrderBook([
      [67536333723, 500, -2],
      [67538314922, 600, -2],
      [67535007022, 500, 2],
      [67538455208, 400, 2]
    ])
    const seed = 59
    const randomizer = new Randomizer(seed)

    return {
      candles: candlesDataProvider(randomizer.fork(), baseCandle.serialize()),
      trades: tradesDataProvider(randomizer.fork(), baseTrade.serialize()),
      book: bookDataProvider(randomizer.fork(), baseBook.serialize())
    }
  }
}

module.exports = BaseApiMock
