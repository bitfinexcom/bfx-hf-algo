/* eslint-env mocha */
'use strict'

const { delay } = require('bluebird')
const { expect } = require('chai')

const { spawnHost, connectHost, destroyHost } = require('../util/host')
const { NEW_ORDER } = require('../util/mimic/signal_types')
const ApiSpy = require('../util/mimic/testing/api_spy')
const BaseApiMock = require('../util/base_api_mock')

describe('ping-pong', () => {
  let host, apiMock, spyServer
  const apiKey = 'api key'
  const apiSecret = 'api secret'

  beforeEach(async () => {
    apiMock = new BaseApiMock({
      apiKey,
      dataProviders: BaseApiMock.getDataProviders()
    })

    spyServer = new ApiSpy(apiMock)

    host = spawnHost({ apiKey, apiSecret, wsURL: apiMock.url() })
    await connectHost(host)
  })

  afterEach(() => {
    destroyHost(host)
    apiMock.close()
  })

  it('basic', async () => {
    const pricesTable = ['100.00', '125.00', '150.00', '175.00', '200.00']
    await host.startAO('bfx-ping_pong', {
      symbol: 'tAAABBB',
      amount: 0.5,
      orderCount: 5,
      pingMinPrice: 100,
      pingMaxPrice: 200,
      pongDistance: 300,
      _margin: false
    })
    await delay(2_000)

    const spyConn = spyServer.connections[0]
    expect(spyConn.countReceived(NEW_ORDER)).to.eq(5)

    spyConn
      .received(NEW_ORDER, ({ fields: [placeholder, details] }, i) => {
        expect(details.symbol).to.eq('tAAABBB')
        expect(details.type).to.eq('EXCHANGE LIMIT')
        expect(details.amount).to.eq('0.50000000')
        expect(+details.price).to.eq(+pricesTable[i])
      })
  })

  it('equal prices', async () => {
    await host.startAO('bfx-ping_pong', {
      symbol: 'tAAABBB',
      amount: 0.5,
      orderCount: 3,
      pingMinPrice: 100,
      pingMaxPrice: 100,
      pongDistance: 300,
      _margin: false
    })
    await delay(2_000)

    const spyConn = spyServer.connections[0]
    expect(spyConn.countReceived(NEW_ORDER), 'incorrect number of orders').to.eq(3)

    spyConn
      .received(NEW_ORDER, ({ fields: [placeholder, details] }, i) => {
        expect(details.symbol).to.eq('tAAABBB')
        expect(details.type).to.eq('EXCHANGE LIMIT')
        expect(details.amount).to.eq('0.50000000')
        expect(details.price).to.eq('100.00')
      })
  })
})
