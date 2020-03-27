/* eslint-env mocha */
'use strict'

process.env.DEBUG = '*'

const assert = require('chai').assert
const { EMA } = require('bfx-hf-indicators')
const { Config } = require('bfx-api-node-core')
const AccumulateDistribute = require('../../../lib/accumulate_distribute')
const testAOLive = require('../../util/test_ao_live')

const { DUST } = Config

// all prices must be set so orders never fill automatically!
testAOLive({
  name: 'Accumulate/Distribute',
  aoID: 'bfx-accumulate_distribute',
  aoClass: AccumulateDistribute,
  defaultParams: {
    symbol: 'tLEOUSD',
    orderType: 'RELATIVE',
    amount: -18,
    sliceAmount: -6,
    sliceInterval: 1000,
    submitDelay: 0,
    cancelDelay: 0,
    _margin: true,
    _futures: false,

    awaitFill: false,
    catchUp: true,

    // set cap & offset so we don't insta-fill
    offsetType: 'trade',
    offsetDelta: 1,

    // capped at EMA(10)
    capType: 'EMA',
    capIndicatorPeriodEMA: 10,
    capIndicatorPriceEMA: 'close',
    capIndicatorTFEMA: 'ONE_MINUTE',
    capDelta: 1
  },

  tests: [{
    description: 'submits initial order on startup',
    exec: ({ harness, done }) => {
      harness.once('exec:order:submit:all', (_, orders) => {
        assert.ok(orders.length === 1, 'expected 1 order')
        assert.strictEqual(orders[0].amount, -6)
        done()
      })
    }
  }, {
    params: { catchUp: true },
    description: 'lowers delay for next order if prev not filled & catch-up enabled',
    exec: ({ harness, done }) => {
      harness.once('exec:order:submit:all', () => {
        harness.next('self:interval_tick', (delay) => {
          assert.strictEqual(delay, 200)
          done()
        })
      })
    }
  }, {
    params: { catchUp: false },
    description: 'respects delay for next order if prev not filled and catch-up disabled',
    exec: ({ harness, done }) => {
      harness.once('exec:order:submit:all', () => {
        harness.next('self:interval_tick', (delay) => {
          assert.strictEqual(delay, 1000)
          done()
        })
      })
    }
  }, {
    params: { catchUp: false, awaitFill: true },
    description: 'awaits fill if requested',
    exec: ({ harness, done }) => {
      harness.once('exec:order:submit:all', () => {
        setTimeout(() => {
          done()
        }, 1200)

        setTimeout(() => {
          harness.once('exec:order:submit:all', () => {
            assert.ok(false, 'should not have submitted again')
          })
        }, 0)
      })
    }
  }, {
    params: {
      offsetType: 'trade',
      offsetDelta: 1,
      capType: 'none'
    },

    description: 'sets order price at offset from last trade if requested',
    exec: ({ instance, harness, done }) => {
      harness.once('exec:order:submit:all', (_, orders) => {
        assert.strictEqual(orders.length, 1)
        assert.isBelow(Math.abs(orders[0].price - (instance.state.lastTrade.price + 1)), DUST)
        done()
      })
    }
  }, {
    params: {
      offsetType: 'trade',
      offsetDelta: 100,
      capType: 'EMA',
      capIndicatorPeriodEMA: 10,
      capIndicatorPriceEMA: 'close',
      capIndicatorTFEMA: 'ONE_MINUTE',
      capDelta: 1
    },

    description: 'caps order price at EMA(10) if requested',
    exec: ({ harness, done }) => {
      const ema = new EMA([10])
      let emaSeeded = false

      harness.once('internal:data:managedCandles', (candles, meta) => {
        if (meta.chanFilter.key.split(':')[2] !== 'tLEOUSD') {
          return
        }

        candles.forEach(c => { ema.add(c.close) })
        emaSeeded = true
      })

      harness.once('exec:order:submit:all', (_, orders) => {
        assert.ok(emaSeeded)
        assert.strictEqual(orders.length, 1)
        assert.isBelow(Math.abs(orders[0].price - (ema.v() + 1)), DUST)
        done()
      })
    }
  }]
})
