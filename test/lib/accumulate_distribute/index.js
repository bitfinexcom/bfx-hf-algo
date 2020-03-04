/* eslint-env mocha */
'use strict'

require('dotenv').config()

if (process.env.API_KEY && process.env.API_SECRET) { // needed for tests
  process.env.DEBUG = '*'

  const assert = require('chai').assert
  const _isFunction = require('lodash/isFunction')
  const { AOAdapter } = require('bfx-hf-ext-plugin-bitfinex')
  const { EMA } = require('bfx-hf-indicators')
  const { Config } = require('bfx-api-node-core')
  const { DUST } = Config
  const AOHost = require('../../../lib/ao_host')
  const {
    PingPong, Iceberg, TWAP, AccumulateDistribute, MACrossover, OCOCO
  } = require('../../../')

  const createTestHarness = require('../../../lib/testing/create_harness')

  const apiKey = process.env.API_KEY
  const apiSecret = process.env.API_SECRET
  const params = {
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
  }

  describe('accumulate_distribute', () => {
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

    it('submits initial order on startup', (done) => {
      spawnHost(async (host) => {
        gid = await host.startAO('bfx-accumulate_distribute', params)
        const instance = host.getAOInstance(gid)
        const iTest = createTestHarness(instance, AccumulateDistribute)

        iTest.once('exec:order:submit:all', async (_, orders, __) => {
          try {
            assert.ok(orders.length === 1, 'expected 1 order')
            assert.strictEqual(orders[0].amount, -6)
            done()
          } catch (e) {
            done(e)
          }
        })
      })
    }).timeout(10000)

    it('lowers delay for next order if prev not filled & catch-up enabled', (done) => {
      spawnHost(async (host) => {
        gid = await host.startAO('bfx-accumulate_distribute', params)
        const instance = host.getAOInstance(gid)
        const iTest = createTestHarness(instance, AccumulateDistribute)

        iTest.once('exec:order:submit:all', () => {
          iTest.once('scheduled_tick', (delay) => {
            try {
              assert.strictEqual(delay, 200)
              done()
            } catch (e) {
              done(e)
            }
          })
        })
      })
    }).timeout(10000)

    it('respects delay for next order if prev not filled and catch-up disabled', (done) => {
      spawnHost(async (host) => {
        gid = await host.startAO('bfx-accumulate_distribute', {
          ...params,
          catchUp: false
        })

        const instance = host.getAOInstance(gid)
        const iTest = createTestHarness(instance, AccumulateDistribute)

        iTest.once('exec:order:submit:all', () => {
          iTest.once('scheduled_tick', (delay) => {
            try {
              assert.strictEqual(delay, 1000)
              done()
            } catch (e) {
              done(e)
            }
          })
        })
      })
    }).timeout(10000)

    it('awaits fill if requested', (done) => {
      spawnHost(async (host) => {
        gid = await host.startAO('bfx-accumulate_distribute', {
          ...params,
          catchUp: false,
          awaitFill: true
        })

        const instance = host.getAOInstance(gid)
        const iTest = createTestHarness(instance, AccumulateDistribute)

        iTest.once('exec:order:submit:all', () => {
          setTimeout(() => {
            done()
          }, 1200)

          setTimeout(() => {
            iTest.once('exec:order:submit:all', () => {
              try {
                assert.ok(false, 'should not have submitted again')
              } catch (e) {
                done(e)
              }
            })
          }, 0)
        })
      })
    }).timeout(10000)

    it('sets order price at offset from last trade if requested', (done) => {
      spawnHost(async (host) => {
        gid = await host.startAO('bfx-accumulate_distribute', {
          ...params,
          offsetType: 'trade',
          offsetDelta: 1,
          capType: 'none'
        })

        const instance = host.getAOInstance(gid)
        const iTest = createTestHarness(instance, AccumulateDistribute)

        iTest.once('exec:order:submit:all', (_, orders) => {
          try {
            assert.strictEqual(orders.length, 1)
            assert.isBelow(Math.abs(orders[0].price - (instance.state.lastTrade.price + 1)), DUST)
            done()
          } catch (e) {
            done(e)
          }
        })
      })
    }).timeout(10000)

    it('caps order price at EMA(10) if requested', (done) => {
      spawnHost(async (host) => {
        gid = await host.startAO('bfx-accumulate_distribute', {
          ...params,
          offsetType: 'trade',
          offsetDelta: 100,
          capType: 'EMA',
          capIndicatorPeriodEMA: 10,
          capIndicatorPriceEMA: 'close',
          capIndicatorTFEMA: 'ONE_MINUTE',
          capDelta: 0
        })

        const instance = host.getAOInstance(gid)
        const iTest = createTestHarness(instance, AccumulateDistribute)
        const ema = new EMA([10])
        let emaSeeded = false

        iTest.once('internal:data:managedCandles', (candles, meta) => {
          if (meta.chanFilter.key.split(':')[2] !== 'tLEOUSD') {
            return
          }

          candles.forEach(c => { ema.add(c.close) })
          emaSeeded = true
        })

        iTest.once('exec:order:submit:all', (_, orders) => {
          try {
            assert.ok(emaSeeded)
            assert.strictEqual(orders.length, 1)
            assert.isBelow(Math.abs(orders[0].price - ema.v()), DUST)
            done()
          } catch (e) {
            done(e)
          }
        })
      })
    }).timeout(10000)
  })
}
