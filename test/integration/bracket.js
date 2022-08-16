/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
'use strict'

const { delay } = require('bluebird')
const { expect } = require('chai')

const { spawnHost, connectHost, destroyHost } = require('../util/host')
const { NEW_ORDER, ORDER_CANCEL } = require('../util/mimic/signal_types')
const ApiSpy = require('../util/mimic/testing/api_spy')
const BaseApiMock = require('../util/base_api_mock')
const orderResponse = require('../util/mimic/responses/order')

function performOrder (host, args = {}) {
  return host.startAO('bfx-bracket', {
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

describe('Bracket', () => {
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

  it('submits OCO order', async () => {
    await performOrder(host)
    await delay(1_000)

    const spyConn = spyServer.connections[0]
    const spySession = apiMock.getSessions()[0]
    const [{ cid, gid }] = spyConn.findReceived(NEW_ORDER).map(message => message.fields[1])

    spySession.streamToMainChannel(ORDER_CANCEL, orderResponse({ id: 0, gid, cid, amount: 0, status: 'EXECUTED' }))
    await delay(1_000)

    expect(spyConn.countReceived(NEW_ORDER)).to.eq(2)
    spyConn
      .received(NEW_ORDER, ({ fields: [placeholder, details] }, i) => {
        if (i === 1) {
          expect(details.price).to.eq('1.7000')
          expect(details.price_oco_stop).to.eq('2.1000')
          expect(details.cid).to.be.a('number')
        }
      })
  })
})
