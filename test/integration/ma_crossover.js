/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
'use strict'

const { delay } = require('bluebird')
const { expect } = require('chai')

const { spawnHost, connectHost, destroyHost } = require('../util/host')
const { NEW_ORDER } = require('../util/mimic/signal_types')
const ApiSpy = require('../util/mimic/testing/api_spy')
const BaseApiMock = require('../util/base_api_mock')

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

describe('MA crossover', () => {
  let host, apiMock, spyServer
  const apiKey = 'api key'
  const apiSecret = 'api secret'

  before(async () => {
    apiMock = new BaseApiMock({
      apiKey,
      dataProviders: BaseApiMock.getDataProviders()
    })

    spyServer = new ApiSpy(apiMock)

    host = spawnHost({ apiKey, apiSecret, wsURL: apiMock.url() })
    await connectHost(host)
  })

  after(() => {
    destroyHost(host)
    apiMock.close()
  })

  it('emits subscribed and order events', async () => {
    await performOrder(host)
    await delay(20_000)

    const spyConn = spyServer.connections[0]

    expect(spyConn.countReceived(NEW_ORDER)).to.eq(1)

    spyConn
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
