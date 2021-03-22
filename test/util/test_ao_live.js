/* eslint-env mocha */
'use strict'

require('dotenv').config()

const Promise = require('bluebird')
const _isFunction = require('lodash/isFunction')
const debug = require('debug')('bfx:hf:algo:test:ao-live')
const createTestHarness = require('../../lib/testing/create_harness')
const AOHost = require('../../lib/ao_host')
const {
  PingPong, Iceberg, TWAP, AccumulateDistribute, MACrossover, OCOCO
} = require('../../')

const { SKIP_LIVE_TESTS, API_KEY, API_SECRET } = process.env

module.exports = ({ name, aoID, aoClass, defaultParams = {}, tests = [] }) => {
  if (!API_KEY || !API_SECRET) {
    debug('API credentials missing on env, skipping live test for %s', name)
    return
  } else if (SKIP_LIVE_TESTS) {
    debug('skipping live tests')
    return
  }

  describe(name, () => {
    let host = null
    let gid = null

    const spawnHost = (onReadyCB) => {
      const wsSettings = {
        apiKey: API_KEY,
        apiSecret: API_SECRET
      }

      host = new AOHost({
        wsSettings,
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

    afterEach(async function () {
      this.timeout(25 * 1000)

      if (gid !== null) {
        const instance = host.getAOInstance(gid)

        // we have to cleanup orders manually, as tests run too fast and do not
        // received confirmations (therefore order IDs are not known)
        if (instance) {
          const { orders = {}, connection } = instance.state

          await host.stopAO(gid) // stop first so it does not detect cancel(s)
          await Promise.delay(5 * 1000) // allow confirmations to come in

          for (const order of Object.values(orders)) {
            await host.getAdapter().cancelOrder(connection, order)
          }

          gid = null
        }
      }

      if (host !== null) {
        await host.close()
        host = null
      }
    })

    tests.forEach((test) => {
      it(test.description, (done) => {
        spawnHost(async (host) => {
          let harness = null

          gid = await host.startAO(aoID, {
            ...defaultParams,
            ...(test.params || {})
          }, async (gid) => {
            const instance = host.getAOInstance(gid)
            harness = createTestHarness(instance, aoClass, done)

            if (test.execEarly) {
              return test.execEarly({ instance, harness, done })
            }
          })

          const instance = host.getAOInstance(gid)

          if (!harness) { // may have been created in execEarly handler
            harness = createTestHarness(instance, aoClass, done)
          }

          return test.exec && test.exec({ instance, harness, done })
        })
      }).timeout(test.timeout || 40 * 1000)
    })
  })
}
