/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
'use strict'

const { delay } = require('bluebird')
const { expect } = require('chai')

const { spawnHost, connectHost, destroyHost } = require('../util/host')
const { NEW_ORDER } = require('../util/mimic/signal_types')
const ApiSpy = require('../util/mimic/testing/api_spy')
const BaseApiMock = require('../util/base_api_mock')
const { Config } = require('../../lib/twap')

function performOrder (host, args = {}) {
  return host.startAO('bfx-twap', {
    symbol: 'tAAABBB',
    amount: 5,
    sliceAmount: 1,
    sliceInterval: 0.3,
    amountDistortion: 0,
    priceDelta: 100,
    priceTarget: 5000,
    priceCondition: Config.PRICE_COND.MATCH_LAST,
    tradeBeyondEnd: true,
    orderType: 'LIMIT',
    _margin: false,
    ...args
  })
}

describe('TWAP', () => {
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

  it('creates all orders', async () => {
    await performOrder(host)
    await delay(2_000)

    const spyConn = spyServer.connections[0]

    expect(spyConn.countReceived(NEW_ORDER)).to.eq(5)

    spyConn
      .received(NEW_ORDER, ({ fields: [placeholder, details] }) => {
        expect(details.cid).to.be.a('number')
        expect(details.symbol).to.eq('tAAABBB')
        expect(details.type).to.eq('EXCHANGE LIMIT')
        expect(details.amount).to.eq('1.00000000')
        expect(+details.price).to.be.within(4900, 5100)
      })
  })

  it('cannot find suitable trades', async () => {
    await performOrder(host, { priceTarget: 6000 })
    await delay(2_000)

    const spyConn = spyServer.connections[0]

    expect(spyConn.countReceived(NEW_ORDER)).to.eq(0)
  })

  it('has correct interval', async () => {
    await performOrder(host, { sliceInterval: 1 })
    await delay(3_500)

    const spyConn = spyServer.connections[0]

    expect(spyConn.countReceived(NEW_ORDER)).to.eq(3)
  })

  it('creates market orders', async () => {
    await performOrder(host, { orderType: 'MARKET' })
    await delay(2_000)

    const spyConn = spyServer.connections[0]

    expect(spyConn.countReceived(NEW_ORDER)).to.eq(5)
    spyConn
      .received(NEW_ORDER, ({ fields: [placeholder, details] }) => {
        expect(details).to.not.have.property('price')
        expect(details.type).to.have.string('MARKET')
      })
  })
})
