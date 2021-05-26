/* eslint-env mocha */
'use strict'

const assert = require('assert')
const declareChannels = require('../../../../lib/ma_crossover/meta/declare_channels')

const getInstance = ({
  params = {}, argParams = {}, stateParams = {}, helperParams = {}
}) => ({
  state: {
    args: {
      symbol: 'tLEOUSD',
      long: { candleTimeFrame: '1m' },
      short: { candleTimeFrame: '5m' }
    },
    ...stateParams
  },

  h: {
    declareChannel: async () => {},
    ...helperParams
  },

  ...params
})

describe('ma_crossover:meta:declare_channels', () => {
  it('declares a candle channel for each needed timeframe', async () => {
    let saw1mChannel = false
    let saw5mChannel = false

    const i = getInstance({
      helperParams: {
        declareChannel: async (instance, channel, filter) => {
          const { key } = filter

          assert.strictEqual(channel, 'candles')

          if (key === 'trade:1m:tLEOUSD') saw1mChannel = true
          if (key === 'trade:5m:tLEOUSD') saw5mChannel = true
        }
      }
    })

    await declareChannels(i, {})

    assert.ok(saw1mChannel)
    assert.ok(saw5mChannel)
  })
})
