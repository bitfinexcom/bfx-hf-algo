/* eslint-env mocha */
'use strict'

const assert = require('assert')
const sinon = require('sinon')
const { EMA } = require('bfx-hf-indicators')
const { Candle } = require('bfx-api-node-models')
const dataManagedCandles = require('../../../../lib/ma_crossover/events/data_managed_candles')

const candleOpts = { open: 1, high: 1.2, low: 0.9, close: 1, volume: 100, mts: 100 }
const CANDLE = new Candle(candleOpts)
const CANDLE_KEY = 'key:1m:tTESTBTC:TESTUSD'

const getInstance = ({
  params = {}, argParams = {}, stateParams = {}, helperParams = {}
}) => ({
  state: {
    lastCandleLong: null,
    lastCandleShort: null,
    longIndicator: new EMA([100]),
    shortIndicator: new EMA([20]),
    args: {
      symbol: 'tTESTBTC:TESTUSD',
      long: { candleTimeFrame: '1m', candlePrice: 'close' },
      short: { candleTimeFrame: '1m', candlePrice: 'close' },
      ...argParams
    },
    ...stateParams
  },

  h: {
    debug: () => {},
    updateState: async () => {},
    emitSelf: async () => {},
    emit: async () => {},
    ...helperParams
  },

  ...params
})

describe('ma_crossover:events:data_managed_candles', () => {
  it('seeds long indicator with all candles if needed', async () => {
    const i = getInstance({})
    const candles = []

    for (let i = 0; i < 240; i += 1) { candles.push(CANDLE) }

    assert.strictEqual(i.state.longIndicator.l(), 0)
    await dataManagedCandles(i, candles, { chanFilter: { key: CANDLE_KEY } })
    assert.strictEqual(i.state.longIndicator.l(), 240)
  })

  it('adds data on long indicator if new candle', async () => {
    const i = getInstance({})
    assert.strictEqual(i.state.longIndicator.l(), 0)
    await dataManagedCandles(i, [CANDLE], { chanFilter: { key: CANDLE_KEY } })
    assert.strictEqual(i.state.longIndicator.l(), 1)
  })

  it('updates data on long indicator if known candle', async () => {
    const i = getInstance({ stateParams: { lastCandleLong: CANDLE } })
    i.state.longIndicator.add(CANDLE.close)
    assert.strictEqual(i.state.longIndicator.l(), 1)
    await dataManagedCandles(i, [CANDLE], { chanFilter: { key: CANDLE_KEY } })
    assert.strictEqual(i.state.longIndicator.l(), 1)
  })

  it('seeds short indicator with all candles if needed', async () => {
    const i = getInstance({})
    const candles = []

    for (let i = 0; i < 240; i += 1) { candles.push(CANDLE) }

    assert.strictEqual(i.state.shortIndicator.l(), 0)
    await dataManagedCandles(i, candles, { chanFilter: { key: CANDLE_KEY } })
    assert.strictEqual(i.state.shortIndicator.l(), 240)
  })

  it('adds data on short indicator if new candle', async () => {
    const i = getInstance({})
    assert.strictEqual(i.state.shortIndicator.l(), 0)
    await dataManagedCandles(i, [CANDLE], { chanFilter: { key: CANDLE_KEY } })
    assert.strictEqual(i.state.shortIndicator.l(), 1)
  })

  it('updates data on short indicator if known candle', async () => {
    const i = getInstance({ stateParams: { lastCandleShort: CANDLE } })
    i.state.shortIndicator.add(CANDLE.close)
    assert.strictEqual(i.state.shortIndicator.l(), 1)
    await dataManagedCandles(i, [CANDLE], { chanFilter: { key: CANDLE_KEY } })
    assert.strictEqual(i.state.shortIndicator.l(), 1)
  })

  it('does not update the candle if outdated candle is received', async () => {
    let sawUpdateOpts = false
    let updateCount = 0
    const i = getInstance({
      stateParams: { lastCandleShort: CANDLE, lastCandleLong: CANDLE },
      helperParams: {
        updateState: () => {
          sawUpdateOpts = true
          updateCount += 1
        }
      }
    })
    i.state.shortIndicator.add(CANDLE.close)
    i.state.longIndicator.add(CANDLE.close)
    const outdatedCandle = new Candle({ ...candleOpts, mts: 99 })
    await dataManagedCandles(i, [outdatedCandle], { chanFilter: { key: CANDLE_KEY } })
    assert.ok(!sawUpdateOpts, 'should not have updated the last candle')
    assert.deepStrictEqual(updateCount, 0, 'should not have updated any candles')
    assert.notDeepStrictEqual(updateCount, 1, 'should not have updated either candles')
  })

  it('submits order and stops if indicators crossed', async () => {
    let sawSubmitOrder = false
    let sawExecStop = false

    const i = getInstance({
      helperParams: {
        emitSelf: async (eventName) => {
          if (eventName === 'submit_order') {
            sawSubmitOrder = true
          }
        },

        emit: async (eventName) => {
          if (eventName === 'exec:stop') {
            sawExecStop = true
          }
        }
      }
    })

    const stubbedCrossed = sinon.stub(i.state.shortIndicator, 'crossed').returns(true)

    await dataManagedCandles(i, [CANDLE], { chanFilter: { key: CANDLE_KEY } })

    assert.ok(sawSubmitOrder, 'should have submitted order')
    assert.ok(sawExecStop, 'should have stopped the algo')

    stubbedCrossed.restore()
  })

  it('does not submit order and stop if indicators did not cross', async () => {
    let sawSubmitOrder = false
    let sawExecStop = false

    const i = getInstance({
      helperParams: {
        emitSelf: async (eventName) => {
          if (eventName === 'submit_order') {
            sawSubmitOrder = true
          }
        },

        emit: async (eventName) => {
          if (eventName === 'exec:stop') {
            sawExecStop = true
          }
        }
      }
    })

    const stubbedCrossed = sinon.stub(i.state.shortIndicator, 'crossed').returns(false)

    await dataManagedCandles(i, [CANDLE], { chanFilter: { key: CANDLE_KEY } })

    assert.ok(!sawSubmitOrder, 'should not have submitted order')
    assert.ok(!sawExecStop, 'should not have stopped the algo')

    stubbedCrossed.restore()
  })
})
