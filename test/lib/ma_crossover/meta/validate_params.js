/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isString = require('lodash/isString')
const validateParams = require('../../../../lib/ma_crossover/meta/validate_params')

const params = {
  orderPrice: 100,
  orderType: 'LIMIT',
  amount: 1,
  _futures: false,
  lev: 3.3,

  long: {
    type: 'ema',
    candlePrice: 'close',
    candleTimeFrame: '1m',
    args: [100]
  },

  short: {
    type: 'ema',
    candlePrice: 'close',
    candleTimeFrame: '1m',
    args: [20]
  }
}

const pairConfig = {
  minSize: 0.02,
  maxSize: 20,
  lev: 5
}

describe('ma_crossover:meta:validate_params', () => {
  describe('validate general order parameters', () => {
    it('returns error on invalid order type', () => {
      const err = validateParams({ ...params, orderType: '' })
      assert.deepStrictEqual(err.field, 'orderType')
      assert(_isString(err.message))
    })

    it('returns error when amount is invalid or zero', () => {
      const invalidErr = validateParams({ ...params, amount: '' })
      assert.deepStrictEqual(invalidErr.field, 'amount')
      assert(_isString(invalidErr.message))

      const zeroErr = validateParams({ ...params, amount: 0 })
      assert.deepStrictEqual(zeroErr.field, 'amount')
      assert(_isString(zeroErr.message))
    })

    it('returns error for order price is invalid for limit orderType', () => {
      const err = validateParams({ ...params, orderPrice: '' })
      assert.deepStrictEqual(err.field, 'orderPrice')
      assert(_isString(err.message))
    })
  })

  describe('validate long ma settings', () => {
    it('returns error when long ma settings is not an object', () => {
      const err = validateParams({ ...params, long: '' })
      assert.deepStrictEqual(err.field, 'longType')
      assert(_isString(err.message))
    })

    it('returns error when the long ma time period is not in proper format', () => {
      const err = validateParams({ ...params, long: { ...params.long, args: [] } })
      assert.deepStrictEqual(err.field, 'longEMAPeriod')
      assert(_isString(err.message))
    })

    it('returns error when the long ma time period is invalid', () => {
      const err = validateParams({ ...params, long: { ...params.long, type: 'ma', args: [''] } })
      assert.deepStrictEqual(err.field, 'longMAPeriod')
      assert(_isString(err.message))
    })

    it('returns error when the long ma candle price is invalid', () => {
      const err = validateParams({ ...params, long: { ...params.long, candlePrice: null } })
      assert.deepStrictEqual(err.field, 'longEMAPrice')
      assert(_isString(err.message))
    })

    it('returns error when the long ma candle timeframe is invalid', () => {
      const err = validateParams({ ...params, long: { ...params.long, candleTimeFrame: null } })
      assert.deepStrictEqual(err.field, 'longEMATF')
      assert(_isString(err.message))
    })
  })

  describe('validate short ma settings', () => {
    it('returns error when short ma settings is not an object', () => {
      const err = validateParams({ ...params, short: '' })
      assert.deepStrictEqual(err.field, 'shortType')
      assert(_isString(err.message))
    })

    it('returns error when the short ma time period is not in proper format', () => {
      const err = validateParams({ ...params, short: { ...params.short, args: [] } })
      assert.deepStrictEqual(err.field, 'shortEMAPeriod')
      assert(_isString(err.message))
    })

    it('returns error when the short ma time period is invalid', () => {
      const err = validateParams({ ...params, short: { ...params.short, type: 'ma', args: [''] } })
      assert.deepStrictEqual(err.field, 'shortMAPeriod')
      assert(_isString(err.message))
    })

    it('returns error when the short ma candle price is invalid', () => {
      const err = validateParams({ ...params, short: { ...params.short, candlePrice: null } })
      assert.deepStrictEqual(err.field, 'shortEMAPrice')
      assert(_isString(err.message))
    })

    it('returns error when the short ma candle timeframe is invalid', () => {
      const err = validateParams({ ...params, short: { ...params.short, candleTimeFrame: null } })
      assert.deepStrictEqual(err.field, 'shortEMATF')
      assert(_isString(err.message))
    })
  })

  describe('validate amount against minimum and maximum order size', () => {
    it('returns error if amount is less than the minimum order size', () => {
      const err = validateParams({ ...params, amount: 0.001 }, pairConfig)
      assert.deepStrictEqual(err.field, 'amount')
      assert(_isString(err.message))
    })

    it('returns error if amount is greater than the maximum order size', () => {
      const err = validateParams({ ...params, amount: 25 }, pairConfig)
      assert.deepStrictEqual(err.field, 'amount')
      assert(_isString(err.message))
    })
  })

  describe('validate leverage for future pairs', () => {
    it('returns error if leverage is not a number', () => {
      const err = validateParams({ ...params, _futures: true, lev: null }, pairConfig)
      assert.deepStrictEqual(err.field, 'lev')
      assert(_isString(err.message))
    })

    it('returns error if leverage is less than 1', () => {
      const err = validateParams({ ...params, _futures: true, lev: 0 }, pairConfig)
      assert.deepStrictEqual(err.field, 'lev')
      assert(_isString(err.message))
    })

    it('returns error if leverage is greater than the allowed leverage', () => {
      const err = validateParams({ ...params, _futures: true, lev: 6 }, pairConfig)
      assert.deepStrictEqual(err.field, 'lev')
      assert(_isString(err.message))
    })
  })
})
