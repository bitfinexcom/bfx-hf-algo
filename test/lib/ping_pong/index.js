/* eslint-env mocha */
'use strict'

process.env.DEBUG = '*'

const _min = require('lodash/min')
const _max = require('lodash/max')
const { assert, expect } = require('chai')
const { preparePrice } = require('bfx-api-node-util')
const testAOLive = require('../../util/test_ao_live')
const PingPong = require('../../../lib/ping_pong')

testAOLive({
  name: 'Ping/Pong',
  aoID: 'bfx-ping_pong',
  aoClass: PingPong,
  defaultParams: {
    _symbol: 'tLEOUSD',
    _margin: true,
    action: 'Buy',
    amount: 6,
    orderCount: 4,
    submitDelaySec: 0,
    cancelDelaySec: 0,

    pingMinPrice: 0.4,
    pingMaxPrice: 0.6,
    pongDistance: 0.1
  },

  tests: [{
    description: 'submits initial ping orders on startup',
    execEarly: ({ harness, done }) => {
      harness.once('exec:order:submit:all', (_, orders, delay) => {
        assert.strictEqual(delay, 0)
        expect(orders).to.have.lengthOf(4)
        assert.strictEqual(_min(orders.map(o => +o.price)), 0.4)
        assert.strictEqual(_max(orders.map(o => +o.price)), 0.6)
        done()
      })
    }
  }, {
    description: 'submits the associated pong when a ping fills',
    execEarly: async ({ harness, done }) => {
      setTimeout(() => {
        harness.once('exec:order:submit:all', (_, orders, delay) => {
          assert.strictEqual(delay, 0)
          expect(orders).to.have.lengthOf(1)
          assert.strictEqual(+orders[0].amount, -6)
          assert.strictEqual(+orders[0].price, 0.7)
          done()
        })

        harness.trigger('orders', 'order_fill', { amount: 0, price: preparePrice(0.7) })
      }, 50) // await initial order submit
    }
  }]
})
