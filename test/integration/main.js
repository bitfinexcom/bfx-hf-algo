/* eslint-env mocha */
'use strict'

const { expect } = require('chai')

const { spawnHost, connectHost, destroyHost } = require('../util/host')
const ApiSpy = require('../util/mimic/testing/api_spy')
const BaseApiMock = require('../util/base_api_mock')

describe('main', () => {
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

  it('auth', async () => {
    expect(spyServer.connections.length).to.eql(1)

    const spyConn = spyServer.connections[0]

    spyConn
      .received('auth', (e) => expect(e.apiKey).to.eq(apiKey))
  })
})
