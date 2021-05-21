/* eslint-env mocha */
'use strict'

const { delay } = require('bluebird')

const { spawnHost, connectHost, destroyHost } = require('../../benchmarks/fixtures/host')
const ApiMock = require('../util/mocks/bitfinex_api_mock')
const { candles: candlesDataProvider } = require('../util/mocks/data-providers')
const Randomizer = require('../util/randomizer')

function performOrder (host) {
  return host.startAO('bfx-ma_crossover', {
    shortType: 'EMA',
    shortEMATF: '1m',
    shortEMAPeriod: '20',
    shortEMAPrice: 'close',
    longType: 'EMA',
    longEMATF: '1m',
    longEMAPeriod: '100',
    longEMAPrice: 'close',
    amount: 1,
    symbol: 'tAAABBB',
    orderType: 'MARKET',
    action: 'Buy',
    _margin: false
  })
}

describe('ema integration test', () => {
  let host, apiMock
  const apiKey = 'api key'
  const apiSecret = 'api secret'
  const baseCandle = [0, 12_000, 15_000, 16_000, 9_000, 3]

  before(async () => {
    const randomizer = new Randomizer()
    console.log('seed: ', randomizer.seed())

    apiMock = new ApiMock({
      dataProviders: {
        candles: candlesDataProvider(randomizer.fork(), baseCandle)
      }
    })
    apiMock.onSessionStarted((session) => {
      session.handleAuth((instance, event) => {
        return event.apiKey === apiKey
      })
    })

    host = spawnHost({ apiKey, apiSecret, wsURL: apiMock.url() })
    await connectHost(host)
  })

  after(() => {
    destroyHost(host)
    apiMock.close()
  })

  it('test', async () => {
    await performOrder(host)
    await delay(30_000)
  })
})
