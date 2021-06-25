/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
'use strict'

const { delay } = require('bluebird')
const { expect } = require('chai')

const { spawnHost, connectHost, destroyHost } = require('../util/host')
const { NEW_ORDER } = require('../util/mimic/signal_types')
const ApiSpy = require('../util/mimic/testing/api_spy')
const BaseApiMock = require('../util/base_api_mock')
const orderResponse = require('../util/mimic/responses/order')

function performOrder (host, args = {}) {
  return host.startAO('bfx-ococo', {
    symbol: 'tAAABBB',
    orderType: 'LIMIT',
    orderPrice: 2,
    amount: 30,
    action: 'Sell',
    limitPrice: 1.7,
    stopPrice: 2.1,
    ocoAmount: 30,
    ocoAction: 'Buy',
    margin: true,
    ...args
  })
}

describe('OCOCO', () => {
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

  it('submits initial order', async () => {
    await performOrder(host)
    await delay(1_000)

    const spyConn = spyServer.connections[0]

    expect(spyConn.countReceived(NEW_ORDER)).to.eq(1)

    spyConn
      .received(NEW_ORDER, ({ fields: [placeholder, details] }) => {
        expect(details.symbol).to.eq('tAAABBB')
        expect(details.type).to.eq('EXCHANGE LIMIT')
      })
  })

})
