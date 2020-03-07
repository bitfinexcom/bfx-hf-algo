/* eslint-env mocha */
'use strict'

require('dotenv').config()

const PI = require('p-iteration')
const Promise = require('bluebird')
const _isFunction = require('lodash/isFunction')
const debug = require('debug')('bfx:hf:algo:test:ao-live')
const { AOAdapter } = require('bfx-hf-ext-plugin-bitfinex')
const createTestHarness = require('../../lib/testing/create_harness')
const AOHost = require('../../lib/ao_host')
const {
  PingPong, Iceberg, TWAP, AccumulateDistribute, MACrossover, OCOCO
} = require('../../')

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
          await PI.forEachSeries(Object.values(orders), (order) => {
            return host.getAdapter().cancelOrderWithDelay(connection, 0, order)
          })

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
