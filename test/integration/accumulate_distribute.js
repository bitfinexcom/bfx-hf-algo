/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
'use strict'

const { delay } = require('bluebird')
const { expect } = require('chai')

const { spawnHost, connectHost, destroyHost } = require('../util/host')
const { NEW_ORDER } = require('../util/mimic/signal_types')
const ApiSpy = require('../util/mimic/testing/api_spy')
const BaseApiMock = require('../util/base_api_mock')

function performOrder (host, args = {}) {
  return host.startAO('bfx-accumulate_distribute', {
    symbol: 'tAAABBB',
    amount: -0.2,
    sliceAmount: -0.1,
    sliceInterval: 10000,
    intervalDistortion: 0.20,
    amountDistortion: 0.20,
    orderType: 'RELATIVE',
    offsetType: 'ask',
    offsetDelta: -10,
    capType: 'bid',
    capDelta: 10,
    catchUp: true,
    awaitFill: true,
    _margin: false,
    ...args
  })
}

describe('Accumulate/Distribute', () => {
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

  it('emits subscribed and order events', async () => {
    await performOrder(host)
    await delay(2_500)

    const spyConn = spyServer.connections[0]

    expect(spyConn.countReceived(NEW_ORDER)).to.eq(1)

    spyConn
      .received('subscribe', (e) => expect(e.channel).to.eq('book'))
      .sent('subscribed', (e) => {
        expect(e.channel).to.eq('book')
        expect(e.chanId).to.be.a('number')
      })
      .received(NEW_ORDER, ({ fields: [placeholder, details] }) => {
        expect(details.symbol).to.eq('tAAABBB')
        expect(details.type).to.eq('EXCHANGE LIMIT')
        expect(+details.amount).to.be.within(-0.12, -0.08)
        expect(+details.price).to.be.within(400, 600)
        expect(details.flags).to.eq(0)
      })
  })
})
