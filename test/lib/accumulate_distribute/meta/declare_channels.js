/* eslint-env mocha */
'use strict'

const assert = require('assert')
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
    for (const bookReqSource of ['relativeOffset', 'relativeCap']) {
      let sawChannel = false
      const i = getInstance({
        argParams: {
          [bookReqSource]: { type: 'trade' }
        },
        helperParams: {
          declareChannel: async (instance, type, filter) => {
            assert.strictEqual(instance, i, 'unknown instance')
            assert.strictEqual(type, 'trades', 'unknown channel type')
            assert.deepStrictEqual(filter, { symbol: 'tBTCUSD' }, 'unknown channel filter')
            sawChannel = true
          }
        }
      })

      await declareChannels(i, 42)
      assert.ok(sawChannel, 'did not see channel declaration')
    }
  })

  it('declares a book channel if the instance has a book requirement', async () => {
    for (const bookReqType of ['bid', 'ask', 'mid']) {
      for (const bookReqSource of ['relativeOffset', 'relativeCap']) {
        let sawChannel = false

        const i = getInstance({
          argParams: {
            [bookReqSource]: { type: bookReqType }
          },

          helperParams: {
            declareChannel: async (instance, type, filter) => {
              assert.strictEqual(instance, i, 'unknown instance')
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
      }
    }
  })

  it('declares candle channels for cap/offset indicators if needed', async () => {
    for (const indicatorType of ['ma', 'ema']) {
      for (const candleReqSource of ['relativeOffset', 'relativeCap']) {
        let sawChannel = false

        const i = getInstance({
          argParams: {
            [candleReqSource]: { type: indicatorType, candleTimeFrame: '1m' }
          },

          helperParams: {
            declareChannel: async (instance, type, filter) => {
              assert.strictEqual(instance, i, 'unknown instance')
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
      }
    }
  })
})
