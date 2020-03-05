/* eslint-env mocha */
'use strict'

require('dotenv').config()

const _isFunction = require('lodash/isFunction')
const debug = require('debug')('bfx:hf:algo:test:ao-live')
const { AOAdapter } = require('bfx-hf-ext-plugin-bitfinex')
const AOHost = require('../../lib/ao_host')
const {
  PingPong, Iceberg, TWAP, AccumulateDistribute, MACrossover, OCOCO
} = require('../../')
const createTestHarness = require('../../lib/testing/create_harness')

const { API_KEY, API_SECRET } = process.env

module.exports = ({ name, aoID, aoClass, defaultParams = {}, tests = [] }) => {
  if (!API_KEY || !API_SECRET) {
    debug('API credentials missing on env, skipping live test for %s', name)
    return
  }

  describe(name, () => {
    let host = null
    let gid = null

    const spawnHost = (onReadyCB) => {
      const adapter = new AOAdapter({
        apiKey: API_KEY,
        apiSecret: API_SECRET
      })

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
      if (gid !== null && host.getAOInstance(gid)) {
        await host.stopAO(gid)
        gid = null
      }

      if (host !== null) {
        await host.close()
        host = null
      }
    })

    tests.forEach((test) => {
      it(test.description, (done) => {
        spawnHost(async (host) => {
          gid = await host.startAO(aoID, {
            ...defaultParams,
            ...(test.params || {})
          })

          const instance = host.getAOInstance(gid)
          const harness = createTestHarness(instance, aoClass, done)

          return test.exec({ instance, harness, done })
        })
      }).timeout(test.timeout || 10 * 1000)
    })
  })
}
