/* eslint-env mocha */
'use strict'

const assert = require('assert')
const sinon = require('sinon')
const { EMA, SMA } = require('bfx-hf-indicators')
const { Candle } = require('bfx-api-node-models')
const dataManagedCandles = require('../../../../lib/ma_crossover/events/data_managed_candles')

const candleOpts = { open: 1, high: 1.2, low: 0.9, close: 1, volume: 100, mts: 100 }
const CANDLE = new Candle(candleOpts)
const CANDLE_KEY = 'key:1m:tTESTBTC:TESTUSD'

const UPTREND_CANDLE_INFO = [
  { open: 2994.06, high: 3028.50, low: 2988, close: 3020.64 },
  { open: 3020.64, high: 3036, low: 3008.52, close: 3030.73 },
  { open: 2994.06, high: 3028.50, low: 2988, close: 3020.64 },
  { open: 3030.75, high: 3059.40, low: 3020.46, close: 3054.33 },
  { open: 2994.06, high: 3028.50, low: 2988, close: 3020.64 },
  { open: 3054.34, high: 3060, low: 3036.53, close: 3052 },
  { open: 3051.99, high: 3109.87, low: 3049.32, close: 3102.29 },
  { open: 3102.29, high: 3104.99, low: 3080.81, close: 3088.70 },
  { open: 3088.71, high: 3147, low: 3081.50, close: 3146.95 },
  { open: 3146.95, high: 3204.04, low: 3132.11, close: 3184.07 },
  { open: 3184.06, high: 3190, low: 3141.12, close: 3165.73 },
  { open: 3165.73, high: 3168.55, low: 3125.39, close: 3148.81 },
  { open: 3148.74, high: 3178.86, low: 3148.58, close: 3151.95 },
  { open: 3151.95, high: 3162.82, low: 3111.89, close: 3144.59 },
  { open: 3144.58, high: 3150, low: 3085.06, close: 3107.02 }
]

const DOWNTREND_CANDLE_INFO = [
  ...UPTREND_CANDLE_INFO,
  { open: 3107.01, high: 3178.93, low: 3104, close: 3161.56 },
  { open: 3161.56, high: 3914.15, low: 3147.49, close: 3163.66 },
  { open: 3163.65, high: 3269, low: 3150.89, close: 3254.83 }
]

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
    tracer: { createSignal: () => ({ meta: {} }) },
    debug: () => {},
    updateState: async () => {},
    emitSelf: async () => {},
    emit: async () => {},
    ...helperParams
  },

  ...params
})

describe('ma_crossover:events:data_managed_candles', () => {
  it('seeds long indicator with ema values calculated with candles after the given emaPeriod', async () => {
    const i = getInstance({})
    const candles = []

    for (let i = 0; i < 240; i += 1) { candles.push(CANDLE) }

    assert.deepStrictEqual(i.state.longIndicator.l(), 0)
    await dataManagedCandles(i, candles, { chanFilter: { key: CANDLE_KEY } })
    assert.deepStrictEqual(i.state.longIndicator.bl(), 100)
    assert.deepStrictEqual(i.state.longIndicator.l(), 141)
  })

  it('adds data on long indicator if new candle', async () => {
    const i = getInstance({})
    assert.deepStrictEqual(i.state.longIndicator.bl(), 0)
    await dataManagedCandles(i, [CANDLE], { chanFilter: { key: CANDLE_KEY } })
    assert.deepStrictEqual(i.state.longIndicator.bl(), 1)
  })

  it('updates data on long indicator if known candle', async () => {
    const i = getInstance({ stateParams: { lastCandleLong: CANDLE } })
    i.state.longIndicator.add(CANDLE.close)
    assert.deepStrictEqual(i.state.longIndicator.bl(), 1)
    await dataManagedCandles(i, [CANDLE], { chanFilter: { key: CANDLE_KEY } })
    assert.deepStrictEqual(i.state.longIndicator.bl(), 1)
  })

  it('seeds short indicator with ema values calculated with candles after the given emaPeriod', async () => {
    const i = getInstance({})
    const candles = []

    for (let i = 0; i < 240; i += 1) { candles.push(CANDLE) }

    assert.deepStrictEqual(i.state.shortIndicator.l(), 0)
    await dataManagedCandles(i, candles, { chanFilter: { key: CANDLE_KEY } })
    assert.deepStrictEqual(i.state.shortIndicator.bl(), 20)
    assert.deepStrictEqual(i.state.shortIndicator.l(), 221)
  })

  it('adds data on short indicator if new candle', async () => {
    const i = getInstance({})
    assert.deepStrictEqual(i.state.shortIndicator.l(), 0)
    await dataManagedCandles(i, [CANDLE], { chanFilter: { key: CANDLE_KEY } })
    assert.deepStrictEqual(i.state.shortIndicator.bl(), 1)
  })

  it('updates data on short indicator if known candle', async () => {
    const i = getInstance({ stateParams: { lastCandleShort: CANDLE } })
    i.state.shortIndicator.add(CANDLE.close)
    assert.deepStrictEqual(i.state.shortIndicator.bl(), 1)
    await dataManagedCandles(i, [CANDLE], { chanFilter: { key: CANDLE_KEY } })
    assert.deepStrictEqual(i.state.shortIndicator.bl(), 1)
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

    for (let n = 0; n < 100; n += 1) {
      i.state.shortIndicator.add(CANDLE.close)
      i.state.longIndicator.add(CANDLE.close)
    }

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

    for (let n = 0; n < 100; n += 1) {
      i.state.shortIndicator.add(CANDLE.close)
      i.state.longIndicator.add(CANDLE.close)
    }

    const stubbedCrossed = sinon.stub(i.state.shortIndicator, 'crossed').returns(false)

    await dataManagedCandles(i, [CANDLE], { chanFilter: { key: CANDLE_KEY } })

    assert.ok(!sawSubmitOrder, 'should not have submitted order')
    assert.ok(!sawExecStop, 'should not have stopped the algo')

    stubbedCrossed.restore()
  })

  it('submits order when golden cross is achieved', async () => {
    let sawSubmitOrder = false
    let sawExecStop = false

    const i = getInstance({
      stateParams: {
        longIndicator: new SMA([9]),
        shortIndicator: new SMA([3])
      },
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

    const uptrendCandles = UPTREND_CANDLE_INFO.map(c => { return new Candle(c) })
    await dataManagedCandles(i, uptrendCandles, { chanFilter: { key: CANDLE_KEY } })
    assert.ok(sawSubmitOrder, 'should have submitted order')
    assert.ok(sawExecStop, 'should have stopped the algo')
  })

  it('submits order when death cross is achieved', async () => {
    let sawSubmitOrder = false
    let sawExecStop = false

    const i = getInstance({
      stateParams: {
        longIndicator: new SMA([9]),
        shortIndicator: new SMA([3])
      },
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

    const downtrendCandles = DOWNTREND_CANDLE_INFO.map(c => { return new Candle(c) })
    await dataManagedCandles(i, downtrendCandles, { chanFilter: { key: CANDLE_KEY } })
    assert.ok(sawSubmitOrder, 'should have submitted order')
    assert.ok(sawExecStop, 'should have stopped the algo')
  })
})
