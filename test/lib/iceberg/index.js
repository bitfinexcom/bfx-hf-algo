/* eslint-env mocha */
'use strict'

require('dotenv').config()

if (process.env.API_KEY && process.env.API_SECRET) { // needed for tests
  process.env.DEBUG = '*'

  // const assert = require('chai').assert
  const _isFunction = require('lodash/isFunction')
  const { AOAdapter } = require('bfx-hf-ext-plugin-bitfinex')
  const createTestHarness = require('../../../lib/testing/create_harness')
  const AOHost = require('../../../lib/ao_host')
  const {
    PingPong, Iceberg, TWAP, AccumulateDistribute, MACrossover, OCOCO
  } = require('../../../')

  const apiKey = process.env.API_KEY
  const apiSecret = process.env.API_SECRET
  const params = {
    symbol: 'tLEOUSD',
    price: 2,
    amount: -12,
    sliceAmount: -6,
    excessAsHidden: true,
    orderType: 'LIMIT',
    submitDelay: 0,
    cancelDelay: 0,
    _margin: true
  }

  describe('iceberg:exec', () => {
    let host = null
    let gid = null

    const spawnHost = (onReadyCB) => {
      const adapter = new AOAdapter({ apiKey, apiSecret })
      host = new AOHost({
        adapter,
        aos: [
          PingPong, Iceberg, TWAP, AccumulateDistribute, MACrossover, OCOCO
        ]
      })

      if (_isFunction(onReadyCB)) {
        host.once('ready', () => onReadyCB(host))
        host.connect()
      }

      return host
    }

    afterEach(async () => {
      if (gid !== null) {
        await host.stopAO(gid)
        gid = null
      }

      if (host !== null) {
        await host.close()
        host = null
      }
    })

    it('submits initial orders on startup', (done) => {
      spawnHost(async (host) => {
        return host.startAO('bfx-iceberg', params, async (gid) => {
          const instance = host.getAOInstance(gid)
          const iTest = createTestHarness(instance, AccumulateDistribute)

          iTest.once('self:submit_orders', () => { done() })
        })
      })
    }).timeout(10000)
  })
}
