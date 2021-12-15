/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isString = require('lodash/isString')
const validateParams = require('../../../../lib/ococo/meta/validate_params')

const params = {
  orderType: 'LIMIT',
  orderPrice: 1,
  amount: 6,

  limitPrice: 6,
  stopPrice: 6,
  ocoAmount: 6,

  action: 'Buy',
  ocoAction: 'Sell',

  _futures: false,
  lev: 3.3,
  hidden: false
}

const pairConfig = {
  minSize: 0.01,
  maxSize: 20,
  lev: 5
}

describe('ococo:meta:validate_params', () => {
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

    it('returns error when order price is invalid for limit orderType', () => {
      const err = validateParams({ ...params, orderType: 'LIMIT', orderPrice: null })
      assert.deepStrictEqual(err.field, 'orderPrice')
      assert(_isString(err.message))
    })

    it('returns error for invalid action', () => {
      const err = validateParams({ ...params, action: 'none' })
      assert.deepStrictEqual(err.field, 'action')
      assert(_isString(err.message))
    })
  })

  describe('validate oco settings', () => {
    it('returns error on invalid limit price', () => {
      const err = validateParams({ ...params, limitPrice: '' })
      assert.deepStrictEqual(err.field, 'limitPrice')
      assert(_isString(err.message))
    })

    it('returns error on invalid stop price', () => {
      const err = validateParams({ ...params, stopPrice: '' })
      assert.deepStrictEqual(err.field, 'stopPrice')
      assert(_isString(err.message))
    })

    it('returns error when oco amount is invalid or zero', () => {
      const invalidErr = validateParams({ ...params, ocoAmount: '' })
      assert.deepStrictEqual(invalidErr.field, 'ocoAmount')
      assert(_isString(invalidErr.message))

      const zeroErr = validateParams({ ...params, ocoAmount: 0 })
      assert.deepStrictEqual(zeroErr.field, 'ocoAmount')
      assert(_isString(zeroErr.message))
    })

    it('returns error for invalid oco action', () => {
      const err = validateParams({ ...params, ocoAction: 'none' })
      assert.deepStrictEqual(err.field, 'ocoAction')
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

  describe('validate oco amount against minimum and maximum order size', () => {
    it('returns error if oco amount is less than the minimum order size', () => {
      const err = validateParams({ ...params, ocoAmount: 0.001 }, pairConfig)
      assert.deepStrictEqual(err.field, 'ocoAmount')
      assert(_isString(err.message))
    })

    it('returns error if oco amount is greater than the maximum order size', () => {
      const err = validateParams({ ...params, ocoAmount: 25 }, pairConfig)
      assert.deepStrictEqual(err.field, 'ocoAmount')
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

  describe('Hidden option for orders', () => {
    it('returns error if hidden option is not boolean', () => {
      const err = validateParams({ ...params, hidden: 'hidden' }, pairConfig)
      assert.deepStrictEqual(err.field, 'hidden')
      assert(_isString(err.message))
    })

    it('returns error if visible on hit option is not boolean', () => {
      const err = validateParams({ ...params, hidden: true, visibleOnHit: 'visibleOnHit' }, pairConfig)
      assert.deepStrictEqual(err.field, 'visibleOnHit')
      assert(_isString(err.message))
    })
  })
})
