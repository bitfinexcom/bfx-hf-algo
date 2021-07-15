/* eslint-env mocha */
'use strict'

const { delay } = require('bluebird')
const { expect } = require('chai')

const { spawnHost, connectHost, destroyHost } = require('../util/host')
const { NEW_ORDER } = require('../util/mimic/signal_types')
const ApiSpy = require('../util/mimic/testing/api_spy')
const BaseApiMock = require('../util/base_api_mock')
const { toBeRejected } = require('../util/chai')

async function performOrder (host, args = {}) {
  await host.startAO('bfx-iceberg', {
    symbol: 'tAAABBB',
    price: 100,
    amount: 2,
    sliceAmount: 0.3,
    excessAsHidden: true,
    orderType: 'LIMIT',
    _margin: false,
    ...args
  })
  await delay(2_000)
}

describe('iceberg', () => {
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
    const amounts = ['1.70000000', '0.30000000']
    await performOrder(host)

    const spyConn = spyServer.connections[0]
    expect(spyConn.countReceived(NEW_ORDER)).to.eq(2)

    spyConn
      .received(NEW_ORDER, ({ fields: [placeholder, details] }, i) => {
        expect(details.cid).to.be.a('number')
        expect(details.amount).to.eq(amounts[i])
        expect(details.price).to.eq('100.00')
      })
  })

  it('not hidden', async () => {
    await performOrder(host, { excessAsHidden: false })

    const spyConn = spyServer.connections[0]
    expect(spyConn.countReceived(NEW_ORDER)).to.eq(1)

    spyConn
      .received(NEW_ORDER, ({ fields: [placeholder, details] }, i) => {
        expect(details.amount).to.eq('0.30000000')
      })
  })

  it('validation', async () => {
    await toBeRejected(performOrder(host, { amount: -1, sliceAmount: 1 }), 'different signs')
    await toBeRejected(performOrder(host, { amount: NaN }), 'invalid amount')
    await toBeRejected(performOrder(host, { price: 0 }), 'invalid price')
    await toBeRejected(performOrder(host, { price: -1 }), 'negative price')
  })
})
