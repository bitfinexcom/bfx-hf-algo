/* eslint-env mocha */
'use strict'

const assert = require('assert')
const PI = require('p-iteration')
const declareChannels = require('../../../../lib/accumulate_distribute/meta/declare_channels')

const getInstance = ({
  params = {}, argParams = {}, stateParams = {}, helperParams = {}
}) => ({
  state: {
    args: { symbol: 'tBTCUSD', ...argParams },
    ...stateParams
  },

  h: {
    declareChannel: async () => {},
    ...helperParams
  },

  ...params
})

describe('accumulate_distribute:meta:declare_channels', () => {
  it('declares a trade channel if the instance has a trade requirement', async () => {
    return PI.forEachSeries(['relativeOffset', 'relativeCap'], async (bookReqSource) => {
      let sawChannel = false
      const i = getInstance({
        argParams: {
          [bookReqSource]: { type: 'trade' }
        },
        helperParams: {
          declareChannel: async (instance, host, type, filter) => {
            assert.strictEqual(instance, i, 'unknown instance')
            assert.strictEqual(host, 42, 'unknown host')
            assert.strictEqual(type, 'trades', 'unknown channel type')
            assert.deepStrictEqual(filter, { symbol: 'tBTCUSD' }, 'unknown channel filter')
            sawChannel = true
          }
        }
      })

      await declareChannels(i, 42)
      assert.ok(sawChannel, 'did not see channel declaration')
    })
  })

  it('declares a book channel if the instance has a book requirement', async () => {
    return PI.forEachSeries(['bid', 'ask', 'mid'], async (bookReqType) => {
      return PI.forEachSeries(['relativeOffset', 'relativeCap'], async (bookReqSource) => {
        let sawChannel = false

        const i = getInstance({
          argParams: {
            [bookReqSource]: { type: bookReqType }
          },

          helperParams: {
            declareChannel: async (instance, host, type, filter) => {
              assert.strictEqual(instance, i, 'unknown instance')
              assert.strictEqual(host, 42, 'unknown host')
              assert.strictEqual(type, 'book', 'unknown channel type')
              assert.deepStrictEqual(filter, {
                symbol: 'tBTCUSD',
                prec: 'R0',
                len: '25'
              }, 'unknown channel filter')

              sawChannel = true
            }
          }
        })

        await declareChannels(i, 42)
        assert.ok(sawChannel, 'did not see channel declaration')
      })
    })
  })

  it('declares candle channels for cap/offset indicators if needed', async () => {
    return PI.forEachSeries(['ma', 'ema'], async (indicatorType) => {
      return PI.forEachSeries(['relativeOffset', 'relativeCap'], async (candleReqSource) => {
        let sawChannel = false

        const i = getInstance({
          argParams: {
            [candleReqSource]: { type: indicatorType, candleTimeFrame: '1m' }
          },

          helperParams: {
            declareChannel: async (instance, host, type, filter) => {
              assert.strictEqual(instance, i, 'unknown instance')
              assert.strictEqual(host, 42, 'unknown host')
              assert.strictEqual(type, 'candles', 'unknown channel type')
              assert.deepStrictEqual(filter, {
                key: 'trade:1m:tBTCUSD'
              }, 'unknown channel filter')

              sawChannel = true
            }
          }
        })

        await declareChannels(i, 42)
        assert.ok(sawChannel, 'did not see channel declaration')
      })
    })
  })
})
