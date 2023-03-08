/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isString = require('lodash/isString')
const validateParams = require('../../../../lib/twap/meta/validate_params')

const validParams = {
  orderType: 'LIMIT',
  amount: 1,
  sliceAmount: 0.1,
  amountDistortion: 0.2,
  sliceInterval: 1000,
  priceTarget: 1000,
  priceCondition: 'MATCH_LAST'
}

const pairConfig = {
  minSize: 0.02,
  maxSize: 20,
  lev: 5
}

describe('twap:meta:validate_params', () => {
  it('returns no error on valid params', () => {
    assert.strictEqual(validateParams(validParams), null)
  })

  it('returns error on invalid order type', () => {
    const err = validateParams({
      ...validParams,
      orderType: 'nope'
    })
    assert.deepStrictEqual(err.field, 'orderType')
    assert(_isString(err.message))
  })

  it('returns error on invalid amount', () => {
    const err = validateParams({
      ...validParams,
      amount: 'nope'
    })
    assert.deepStrictEqual(err.field, 'amount')
    assert(_isString(err.message))
  })

  it('returns error on invalid or negative slice interval', () => {
    const invalidErr = validateParams({
      ...validParams,
      sliceAmount: 'nope'
    })
    assert.deepStrictEqual(invalidErr.field, 'sliceAmount')
    assert(_isString(invalidErr.message))

    const negativeCheckErr = validateParams({
      ...validParams,
      sliceAmount: -100
    })
    assert.deepStrictEqual(negativeCheckErr.field, 'sliceAmount')
    assert(_isString(negativeCheckErr.message))
  })

  it('returns error if amount & sliceAmount differ in sign', () => {
    const err = validateParams({
      ...validParams,
      amount: -1
    })
    assert.deepStrictEqual(err.field, 'sliceAmount')
    assert(_isString(err.message))
  })

  it('returns error on non-numeric and non-string price target', () => {
    const err = validateParams({
      ...validParams,
      priceTarget: { nope: 42 }
    })
    assert.deepStrictEqual(err.field, 'priceTarget')
    assert(_isString(err.message))
  })

  it('returns error on negative explicit price target', () => {
    const err = validateParams({
      ...validParams,
      priceTarget: -1
    })
    assert.deepStrictEqual(err.field, 'priceTarget')
    assert(_isString(err.message))
  })

  it('returns error on numeric price target with invalid price condition', () => {
    const err = validateParams({
      ...validParams,
      priceTarget: 100,
      priceCondition: 'nope'
    })
    assert.deepStrictEqual(err.field, 'priceTarget')
    assert(_isString(err.message))
  })

  it('returns error on conditional price target with invalid condition', () => {
    const err = validateParams({
      ...validParams,
      priceTarget: 'nope'
    })
    assert.deepStrictEqual(err.field, 'priceTarget')
    assert(_isString(err.message))
  })

  it('returns error on non-numeric price delta if provided', () => {
    const err = validateParams({
      ...validParams,
      priceDelta: 'nope'
    })
    assert.deepStrictEqual(err.field, 'priceDelta')
    assert(_isString(err.message))
  })

  it('returns error when slice amount is greater than total amount', () => {
    const buyOrderErr = validateParams({
      ...validParams,
      sliceAmount: 2
    })
    assert.deepStrictEqual(buyOrderErr.field, 'sliceAmount')
    assert(_isString(buyOrderErr.message), 'doesn\'t return error when submitted buy order')

    const sellOrderErr = validateParams({
      ...validParams,
      amount: -1,
      sliceAmount: -2
    })
    assert.deepStrictEqual(sellOrderErr.field, 'sliceAmount')
    assert(_isString(sellOrderErr.message), 'doesn\'t return error when submitted buy order')
  })

  it('returns error if amount is less than the minimum order size', () => {
    const err = validateParams({
      ...validParams,
      amount: 0.01,
      sliceAmount: 0.0005
    }, pairConfig)
    assert.deepStrictEqual(err.field, 'amount')
    assert(_isString(err.message))
  })

  it('returns error if slice amount is less than the minimum order size', () => {
    const err = validateParams({
      ...validParams,
      sliceAmount: 0.001
    }, pairConfig)
    assert.deepStrictEqual(err.field, 'sliceAmount')
    assert(_isString(err.message))
  })

  it('returns error if amount is greater than the maximum order size', () => {
    const err = validateParams({
      ...validParams,
      amount: 25
    }, pairConfig)
    assert.deepStrictEqual(err.field, 'amount')
    assert(_isString(err.message))
  })

  it('returns error if slice amount is greater than the maximum order size', () => {
    const err = validateParams({
      ...validParams,
      sliceAmount: 25
    }, pairConfig)
    assert.deepStrictEqual(err.field, 'sliceAmount')
    assert(_isString(err.message))
  })

  it('returns error if leverage is greater than the allowed leverage', () => {
    const err = validateParams({
      ...validParams,
      _futures: true,
      lev: 6
    }, pairConfig)
    assert.deepStrictEqual(err.field, 'lev')
    assert(_isString(err.message))
  })
})
