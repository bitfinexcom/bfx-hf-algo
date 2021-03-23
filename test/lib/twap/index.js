/* eslint-env mocha */
'use strict'

process.env.DEBUG = '*'

const Promise = require('bluebird')
const { OrderBook } = require('bfx-api-node-models')
const { assert, expect } = require('chai')
const TWAP = require('../../../lib/twap')
const testAOLive = require('../../util/test_ao_live')

testAOLive({
  name: 'TWAP',
  aoID: 'bfx-twap',
  aoClass: TWAP,
  defaultParams: {
    _symbol: 'tLEOUSD',
    _margin: true,
    orderType: 'LIMIT',
    amount: -18,
    sliceAmount: -6,
    sliceInterval: 200,
    submitDelaySec: 0,

    priceTarget: 'OB_SIDE',
    priceDelta: 0,

    tradeBeyondEnd: false
  },

  tests: [{
    params: { priceTarget: 'OB_MID', price: 2 },
    description: 'awaits OB mid price match if requested',
    exec: async ({ instance, harness, done }) => {
      harness.once('exec:order:submit:all', (_, orders, delay) => {
        assert.strictEqual(delay, 0)
        expect(orders).to.have.lengthOf(1)
        assert.strictEqual(+orders[0].price, 2)
        done()
      })

      const book = new OrderBook()
      book.midPrice = () => 2

      await harness.trigger('data', 'managedBook', book, { chanFilter: { symbol: 'tLEOUSD' } })
      await harness.trigger('self', 'interval_tick') // force tick
    }
  }, {
    params: { priceTarget: 'OB_SIDE', price: 2 },
    description: 'awaits OB side price match if requested',
    exec: async ({ harness, done }) => {
      harness.once('exec:order:submit:all', (_, orders, delay) => {
        assert.strictEqual(delay, 0)
        expect(orders).to.have.lengthOf(1)
        assert.strictEqual(+orders[0].price, 2)
        done()
      })

      const book = new OrderBook()
      book.topBid = () => 2

      await harness.trigger('data', 'managedBook', book, { chanFilter: { symbol: 'tLEOUSD' } })
      await harness.trigger('self', 'interval_tick') // force tick
    }
  }, {
    params: { priceTarget: 'LAST', price: 2 },
    description: 'awaits last trade price match if requested',
    exec: async ({ harness, instance, done }) => {
      harness.once('exec:order:submit:all', (_, orders, delay) => {
        assert.strictEqual(delay, 0)
        expect(orders).to.have.lengthOf(1)
        assert.strictEqual(+orders[0].price, 2)
        done()
      })

      instance.state.lastTrade = { price: 2 }

      await harness.trigger('self', 'interval_tick') // force tick
    }
  }, {
    params: { priceTarget: 'CUSTOM', priceCondition: 'MATCH_MIDPOINT', price: 2 },
    description: 'awaits custom price match against OB mid if requested',
    exec: async ({ harness, done }) => {
      harness.once('exec:order:submit:all', (_, orders, delay) => {
        assert.strictEqual(delay, 0)
        expect(orders).to.have.lengthOf(1)
        assert.strictEqual(+orders[0].price, 2)
        done()
      })

      const book = new OrderBook()
      book.midPrice = () => 2

      await harness.trigger('data', 'managedBook', book, { chanFilter: { symbol: 'tLEOUSD' } })
      await harness.trigger('self', 'interval_tick') // force tick
    }
  }, {
    params: { priceTarget: 'CUSTOM', priceCondition: 'MATCH_SIDE', price: 2 },
    description: 'awaits custom price match against OB side if requested',
    exec: async ({ harness, done }) => {
      harness.once('exec:order:submit:all', (_, orders, delay) => {
        assert.strictEqual(delay, 0)
        expect(orders).to.have.lengthOf(1)
        assert.strictEqual(+orders[0].price, 2)
        done()
      })

      const book = new OrderBook()
      book.topBid = () => 2

      await harness.trigger('data', 'managedBook', book, { chanFilter: { symbol: 'tLEOUSD' } })
      await harness.trigger('self', 'interval_tick') // force tick
    }
  }, {
    params: { priceTarget: 'CUSTOM', priceCondition: 'MATCH_LAST', price: 2 },
    description: 'awaits custom price match against last trade if requested',
    exec: async ({ harness, instance, done }) => {
      harness.once('exec:order:submit:all', (_, orders, delay) => {
        assert.strictEqual(delay, 0)
        expect(orders).to.have.lengthOf(1)
        assert.strictEqual(+orders[0].price, 2)
        done()
      })

      instance.state.lastTrade = { price: 2 }

      await harness.trigger('self', 'interval_tick') // force tick
    }
  }, {
    params: { priceTarget: 'CUSTOM', priceCondition: 'MATCH_LAST', price: 2, tradeBeyondEnd: true },
    description: 'leaves last order open if trade-beyond-end flag is enabled',
    exec: async ({ harness, instance, done }) => {
      instance.state.lastTrade = { price: 2 }

      await harness.await('exec:order:submit:all', async () => {
        return harness.trigger('self', 'interval_tick') // force tick
      })

      await Promise.delay(10)

      instance.state.lastTrade = { price: 2 }

      await harness.await('exec:order:submit:all', async () => {
        return harness.trigger('self', 'interval_tick') // force tick
      })

      await Promise.delay(10)

      assert.strictEqual(Object.values(instance.state.orders).length, 2)
    }
  }]
})
