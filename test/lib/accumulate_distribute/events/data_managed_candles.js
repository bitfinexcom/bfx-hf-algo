/* eslint-env mocha */
'use strict'

const assert = require('assert')
const { EMA } = require('bfx-hf-indicators')
const { Candle } = require('bfx-api-node-models')
const dataManagedCandles = require('../../../../lib/accumulate_distribute/events/data_managed_candles')

const CANDLE_KEY = 'trade:1m:tBTCUSD'
const CANDLE = new Candle({
  open: 9000,
  high: 9100,
  low: 9000,
  close: 9050,
  volume: 9001,
  mts: 0
})

const getInstance = ({
  params = {}, argParams = {}, stateParams = {}, helperParams = {}
}) => ({
  state: {
    offsetIndicator: new EMA([10]),
    capIndicator: new EMA([10]),
    args: {
      relativeOffset: { type: 'ema', candleTimeFrame: '1m' },
      relativeCap: { type: 'ema', candleTimeFrame: '1m' },
      ...argParams
    },
    ...stateParams
  },

  h: {
    emit: () => {},
    debug: () => {},
    updateState: async () => {},
    ...helperParams
  },

  ...params
})

describe('accumulate_distribute:events:data_managed_candles', () => {
  it('does nothing if the AO has no indicator offset or cap', async () => {
    const i = getInstance({
      argParams: {
        symbol: 'tBTCUSD',
        relativeOffset: {},
        relativeCap: {}
      },

      helperParams: {
        updateState: async () => assert.ok(false, 'should not have updated state')
      }
    })

    return dataManagedCandles(i, [], { chanFilter: { key: CANDLE_KEY } })
  })

  it('seeds indicators if they have no data, (expects snapshot)', async () => {
    const candles = [CANDLE.serialize(), CANDLE.serialize()]
    let candlesAddedToOffsetIndicator = 0
    let candlesAddedToCapIndicator = 0
    let stateUpdated = false

    const i = getInstance({
      argParams: { symbol: 'tBTCUSD' },
      stateParams: {
        offsetIndicator: {
          getName: () => 'offset indicator',
          isSeeded: () => candlesAddedToOffsetIndicator !== 0,
          add: (c) => { candlesAddedToOffsetIndicator++ },
          v: () => 1
        },

        capIndicator: {
          getName: () => 'cap indicator',
          isSeeded: () => candlesAddedToCapIndicator !== 0,
          add: (c) => { candlesAddedToCapIndicator++ },
          v: () => 1
        }
      },

      helperParams: {
        updateState: async () => { stateUpdated = true }
      }
    })

    await dataManagedCandles(i, candles, { chanFilter: { key: CANDLE_KEY } })

    assert.ok(stateUpdated, 'state was not updated')
    assert.strictEqual(candlesAddedToOffsetIndicator, 2)
    assert.strictEqual(candlesAddedToCapIndicator, 2)
  })

  it('updates cap indicator if needed', async () => {
    const candles = [Candle.unserialize({
      ...CANDLE.toJS(),
      high: 42
    })]

    let stateUpdated = false
    let capCandleUpdated = false

    const i = getInstance({
      argParams: {
        symbol: 'tBTCUSD',
        relativeCap: { type: 'ema', candleTimeFrame: '1m', candlePrice: 'high' },
        relativeOffset: {}
      },

      stateParams: {
        lastCandleCap: { mts: 0 },
        offsetIndicator: null,
        capIndicator: {
          isSeeded: () => true,
          getName: () => 'cap indicator',
          v: () => 1,
          update: (price) => {
            assert.strictEqual(price, 42, 'got wrong candle')
            capCandleUpdated = true
          }
        }
      },

      helperParams: {
        updateState: async () => { stateUpdated = true }
      }
    })

    await dataManagedCandles(i, candles, { chanFilter: { key: CANDLE_KEY } })

    assert.ok(stateUpdated, 'state was not updated')
    assert.ok(capCandleUpdated, 'cap candle not updated')
  })

  it('updates offset indicator if needed', async () => {
    const candles = [Candle.unserialize({
      ...CANDLE.toJS(),
      high: 42
    })]

    let stateUpdated = false
    let offsetCandleUpdated = false

    const i = getInstance({
      argParams: {
        symbol: 'tBTCUSD',
        relativeOffset: { type: 'ema', candleTimeFrame: '1m', candlePrice: 'high' },
        relativeCap: {}
      },

      stateParams: {
        lastCandleOffset: { mts: 0 },
        capIndicator: null,
        offsetIndicator: {
          getName: () => 'offset indicator',
          v: () => 1,
          isSeeded: () => true,
          update: (price) => {
            assert.strictEqual(price, 42, 'got wrong candle')
            offsetCandleUpdated = true
          }
        }
      },

      helperParams: {
        updateState: async () => { stateUpdated = true }
      }
    })

    await dataManagedCandles(i, candles, { chanFilter: { key: CANDLE_KEY } })

    assert.ok(stateUpdated, 'state was not updated')
    assert.ok(offsetCandleUpdated, 'offset candle not updated')
  })
})
