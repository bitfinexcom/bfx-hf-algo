/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isString = require('lodash/isString')
const validateParams = require('../../../../lib/accumulate_distribute/meta/validate_params')

const params = {
  limitPrice: 1,
  amount: 1,
  sliceAmount: 1,
  orderType: 'LIMIT',
  intervalDistortion: 0,
  amountDistortion: 0,
  sliceInterval: 1000,
  relativeOffset: {
    type: 'ema',
    candlePrice: 'low',
    candleTimeFrame: '5m',
    args: [10],
    delta: 0
  },
  relativeCap: {
    type: 'ema',
    candlePrice: 'low',
    candleTimeFrame: '5m',
    args: [10],
    delta: 0
  },
  catchUp: true,
  postonly: false,
  awaitFill: true,
  lev: 3.3,
  _futures: true
}

const pairConfig = {
  minSize: 0.01,
  maxSize: 20,
  lev: 5
}

describe('accumulate_distribute:meta:validate_params', () => {
  describe('validate general order parameters', () => {
    it('returns error on invalid order type', () => {
      const err = validateParams({ ...params, orderType: 'unknown' })
      assert.deepStrictEqual(err.field, 'orderType')
      assert(_isString(err.message))
    })

    it('returns error when amount is invalid or zero', () => {
      const invalidErr = validateParams({ ...params, amount: 'not' })
      assert.deepStrictEqual(invalidErr.field, 'amount')
      assert(_isString(invalidErr.message))

      const zeroErr = validateParams({ ...params, amount: 0 })
      assert.deepStrictEqual(zeroErr.field, 'amount')
      assert(_isString(zeroErr.message))
    })

    it('returns error when slice amount is invalid or zero', () => {
      const invalidErr = validateParams({ ...params, sliceInterval: 'it' })
      assert.deepStrictEqual(invalidErr.field, 'sliceIntervalSec')
      assert(_isString(invalidErr.message))

      const lessThanZeroErr = validateParams({ ...params, sliceInterval: -1 })
      assert.deepStrictEqual(lessThanZeroErr.field, 'sliceIntervalSec')
      assert(_isString(lessThanZeroErr.message))
    })

    it('returns error when slice interval is invalid or less than or equals zero', () => {
      const invalidErr = validateParams({ ...params, sliceAmount: 'not' })
      assert.deepStrictEqual(invalidErr.field, 'sliceAmount')
      assert(_isString(invalidErr.message))

      const zeroErr = validateParams({ ...params, sliceAmount: 0 })
      assert.deepStrictEqual(zeroErr.field, 'sliceAmount')
      assert(_isString(zeroErr.message))
    })

    it('returns error when interval distortion is invalid', () => {
      const err = validateParams({ ...params, intervalDistortion: 'does\'t' })
      assert.deepStrictEqual(err.field, 'intervalDistortion')
      assert(_isString(err.message))
    })

    it('returns error when amount distortion is invalid', () => {
      const err = validateParams({ ...params, amountDistortion: 'stop' })
      assert.deepStrictEqual(err.field, 'amountDistortion')
      assert(_isString(err.message))
    })

    it('returns error when slice amount and amount are not the same sign', () => {
      const err = validateParams({ ...params, amount: 1, sliceAmount: -1 })
      assert.deepStrictEqual(err.field, 'sliceAmount')
      assert(_isString(err.message))
    })

    it('returns error when slice amount is greater than the amount', () => {
      const err = validateParams({ ...params, sliceAmount: 10 })
      assert.deepStrictEqual(err.field, 'sliceAmount')
      assert(_isString(err.message))
    })

    it('returns error when limit price is invalid for limit order type', () => {
      const err = validateParams({ ...params, orderType: 'LIMIT', limitPrice: 'nope' })
      assert.deepStrictEqual(err.field, 'limitPrice')
      assert(_isString(err.message))
    })

    it('returns error when catchUp field is not boolean', () => {
      const err = validateParams({ ...params, catchUp: 'day' })
      assert.deepStrictEqual(err.field, 'catchUp')
      assert(_isString(err.message))
    })

    it('returns error when awaitFill field is not boolean', () => {
      const err = validateParams({ ...params, awaitFill: 'and' })
      assert.deepStrictEqual(err.field, 'awaitFill')
      assert(_isString(err.message))
    })

    it('returns error when postonly field is not boolean', () => {
      const err = validateParams({ ...params, postonly: 'and' })
      assert.deepStrictEqual(err.field, 'postonly')
      assert(_isString(err.message))
    })
  })

  describe('validate relative cap parameters', () => {
    it('returns error if cap delta is not a number', () => {
      const err = validateParams({ ...params, relativeCap: { ...params.relativeCap, delta: '' } }, pairConfig)
      assert.deepStrictEqual(err.field, 'capDelta')
      assert(_isString(err.message))
    })

    it('returns error if cap candle price is invalid', () => {
      const err = validateParams({ ...params, relativeCap: { ...params.relativeCap, type: 'sma', candlePrice: false } }, pairConfig)
      assert.deepStrictEqual(err.field, 'capIndicatorPriceSMA')
      assert(_isString(err.message))
    })

    it('returns error if cap candle time frame is invalid', () => {
      const err = validateParams({ ...params, relativeCap: { ...params.relativeCap, candleTimeFrame: '' } }, pairConfig)
      assert.deepStrictEqual(err.field, 'capIndicatorTFEMA')
      assert(_isString(err.message))
    })

    it('returns error if cap args does not have a valid number', () => {
      const err = validateParams({ ...params, relativeCap: { ...params.relativeCap, args: ['nope'] } }, pairConfig)
      assert.deepStrictEqual(err.field, 'capIndicatorPeriodEMA')
      assert(_isString(err.message))
    })
  })

  describe('validate relative offset parameters', () => {
    it('returns error if offset delta is not a number', () => {
      const err = validateParams({ ...params, relativeOffset: { ...params.relativeOffset, delta: '' } }, pairConfig)
      assert.deepStrictEqual(err.field, 'offsetDelta')
      assert(_isString(err.message))
    })

    it('returns error if offset candle price is invalid', () => {
      const err = validateParams({ ...params, relativeOffset: { ...params.relativeOffset, type: 'sma', candlePrice: false } }, pairConfig)
      assert.deepStrictEqual(err.field, 'offsetIndicatorPriceSMA')
      assert(_isString(err.message))
    })

    it('returns error if offset candle time frame is invalid', () => {
      const err = validateParams({ ...params, relativeOffset: { ...params.relativeOffset, candleTimeFrame: '' } }, pairConfig)
      assert.deepStrictEqual(err.field, 'offsetIndicatorTFEMA')
      assert(_isString(err.message))
    })

    it('returns error if offset args does not have a valid number', () => {
      const err = validateParams({ ...params, relativeOffset: { ...params.relativeOffset, args: ['nope'] } }, pairConfig)
      assert.deepStrictEqual(err.field, 'offsetIndicatorPeriodEMA')
      assert(_isString(err.message))
    })
  })

  describe('validate amount against minimum and maximum order size', () => {
    it('returns error if amount is less than the minimum order size', () => {
      const err = validateParams({ ...params, amount: 0.001, sliceAmount: 0.001 }, pairConfig)
      assert.deepStrictEqual(err.field, 'amount')
      assert(_isString(err.message))
    })

    it('returns error if amount is greater than the maximum order size', () => {
      const err = validateParams({ ...params, amount: 25 }, pairConfig)
      assert.deepStrictEqual(err.field, 'amount')
      assert(_isString(err.message))
    })
  })

  describe('validate slice amount against minimum and maximum order size', () => {
    it('returns error if slice amount is less than the minimum order size', () => {
      const err = validateParams({ ...params, sliceAmount: 0.001 }, pairConfig)
      assert.deepStrictEqual(err.field, 'sliceAmount')
      assert(_isString(err.message))
    })

    it('returns error if slice amount is greater than the maximum order size', () => {
      const err = validateParams({ ...params, sliceAmount: 25 }, pairConfig)
      assert.deepStrictEqual(err.field, 'sliceAmount')
      assert(_isString(err.message))
    })
  })

  describe('validate leverage for future pairs', () => {
    it('returns error if leverage is not a number', () => {
      const err = validateParams({ ...params, lev: '' }, pairConfig)
      assert.deepStrictEqual(err.field, 'lev')
      assert(_isString(err.message))
    })

    it('returns error if leverage is less than 1', () => {
      const err = validateParams({ ...params, lev: 0 }, pairConfig)
      assert.deepStrictEqual(err.field, 'lev')
      assert(_isString(err.message))
    })

    it('returns error if leverage is greater than the allowed leverage', () => {
      const err = validateParams({ ...params, lev: 6 }, pairConfig)
      assert.deepStrictEqual(err.field, 'lev')
      assert(_isString(err.message))
    })
  })
})
