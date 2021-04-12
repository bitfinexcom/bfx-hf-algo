/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isObject = require('lodash/isObject')
const processParams = require('../../../../lib/accumulate_distribute/meta/process_params')

const args = {
  _symbol: 'tBTCUSD',
  _futures: true,
  lev: 3.3,
  sliceIntervalSec: 1,
  amountDistortion: 2,
  intervalDistortion: 2,
  orderType: 'RELATIVE',
  offsetType: 'EMA',
  offsetDelta: 42,
  offsetIndicatorPriceEMA: 'high',
  offsetIndicatorTFEMA: 'ONE_MINUTE',
  offsetIndicatorPeriodEMA: 10,
  capType: 'MA',
  capDelta: 12,
  capIndicatorPriceMA: 'low',
  capIndicatorTFMA: 'FIVE_MINUTES',
  capIndicatorPeriodMA: 20,
  amount: 7,
  sliceAmount: 3
}

describe('accumulate_distribute:meta:process_params', () => {
  it('parses basic data', () => {
    const params = processParams(args)

    assert.strictEqual(params.symbol, 'tBTCUSD', 'incorrect symbol')
    assert.strictEqual(params.lev, 3.3, 'incorrect leverage')
    assert.strictEqual(params.sliceInterval, 1000, 'incorrect slice interval')
    assert.strictEqual(params.amount, 7, 'incorrect amount')
    assert.strictEqual(params.sliceAmount, 3, 'incorrect slice amount')
  })

  it('provides sane defaults', () => {
    const params = processParams({
      ...args,
      amountDistortion: null,
      intervalDistortion: null
    })

    assert.strictEqual(params.amountDistortion, 0, 'incorrect amount distortion')
    assert.strictEqual(params.intervalDistortion, 0, 'incorrect interval distortion')
  })

  it('parses relative cap and offset', () => {
    const params = processParams(args)

    assert.ok(_isObject(params.relativeCap), 'relative cap not an object')
    assert.strictEqual(params.relativeCap.candlePrice, 'low', 'incorrect candle price')
    assert.strictEqual(params.relativeCap.candleTimeFrame, '5m', 'incorrect indicator time frame')
    assert.deepStrictEqual(params.relativeCap.args, [20], 'incorrect indicator args')

    assert.ok(_isObject(params.relativeOffset), 'relative offset not an object')
    assert.strictEqual(params.relativeOffset.candlePrice, 'high', 'incorrect candle price')
    assert.strictEqual(params.relativeOffset.candleTimeFrame, '1m', 'incorrect indicator time frame')
    assert.deepStrictEqual(params.relativeOffset.args, [10], 'incorrect indicator args')
  })

  it('negates amount on sell', () => {
    const params = processParams({ ...args, action: 'Sell' })

    assert.strictEqual(params.amount, -7, 'incorrect amount')
    assert.strictEqual(params.sliceAmount, -3, 'incorrect slice amount')
  })
})
