/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
'use strict'

const { delay } = require('bluebird')
const { Candle } = require('bfx-api-node-models')
const { expect } = require('chai')

const { spawnHost, connectHost, destroyHost } = require('../util/host')
const ApiMock = require('../util/mimic/bitfinex_api_mock')
const { candles: candlesDataProvider } = require('../util/mimic/data-providers')
const Randomizer = require('../util/randomizer')
const authHandler = require('../util/mimic/handlers/auth')
const pingHandler = require('../util/mimic/handlers/ping')
const subscribeToChannelHandler = require('../util/mimic/handlers/subscribe_to_channel')
const newOrderHandler = require('../util/mimic/handlers/new_order')
const unsubscribeHandler = require('../util/mimic/handlers/unsubscribe')
const { NEW_ORDER } = require('../util/mimic/signal_types')
const ApiSpy = require('../util/mimic/testing/api_spy')

function performOrder (host) {
  return host.startAO('bfx-ma_crossover', {
    shortType: 'EMA',
    shortEMATF: '1m',
    shortEMAPeriod: '5',
    shortEMAPrice: 'close',
    longType: 'EMA',
    longEMATF: '1m',
    longEMAPeriod: '15',
    longEMAPrice: 'close',
    amount: 1,
    symbol: 'tAAABBB',
    orderType: 'MARKET',
    action: 'Buy',
    _margin: false
  })
}

describe('ema integration test', () => {
  let host, apiMock, spyServer
  const apiKey = 'api key'
  const apiSecret = 'api secret'
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
  const dataProviders = {
    candles: candlesDataProvider(randomizer.fork(), baseCandle.serialize())
  }

  before(async () => {
    apiMock = new ApiMock({
      session: {
        eventHandlers: {
          auth: authHandler(event => event.apiKey === apiKey),
          ping: pingHandler,
          subscribe: subscribeToChannelHandler(dataProviders),
          unsubscribe: unsubscribeHandler,
          [NEW_ORDER]: newOrderHandler
        }
      }
    })

    spyServer = new ApiSpy(apiMock)

    host = spawnHost({ apiKey, apiSecret, wsURL: apiMock.url() })
    await connectHost(host)
  })

  after(() => {
    destroyHost(host)
    apiMock.close()
  })

  it('test', async () => {
    await performOrder(host)
    await delay(20_000)

    expect(spyServer.connections.length).to.eql(1)
    spyServer.connections.forEach(spyConn => {
      expect(spyConn.countReceived(NEW_ORDER)).to.eq(1)

      spyConn
        .received('auth', (e) => expect(e.apiKey).to.eq(apiKey))
        .received('subscribe', (e) => expect(e.channel).to.eq('candles'))
        .sent('subscribed', (e) => {
          expect(e.key).to.eq('trade:1m:tAAABBB')
          expect(e.chanId).to.be.a('number')
        })
        .received(NEW_ORDER, ({ fields: [placeholder, details] }) => {
          expect(details.symbol).to.eq('tAAABBB')
          expect(details.type).to.eq('EXCHANGE MARKET')
          expect(details.amount).to.eq('1.00000000')
          expect(details.flags).to.eq(0)
        })
    })
  })
})
