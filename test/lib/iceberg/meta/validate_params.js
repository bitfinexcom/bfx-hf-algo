/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isString = require('lodash/isString')
const validateParams = require('../../../../lib/iceberg/meta/validate_params')

const validParams = {
  price: 1000,
  orderType: 'LIMIT',
  amount: 1,
  sliceAmount: 0.1
}

const pairConfig = {
  minSize: 0.01,
  maxSize: 20,
  lev: 5
}

describe('iceberg:meta:validate_params', () => {
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

  it('returns error on invalid slice amount', () => {
    const err = validateParams({
      ...validParams,
      sliceAmount: 'nope'
    })
    assert.deepStrictEqual(err.field, 'sliceAmount')
    assert(_isString(err.message))
  })

  it('returns error if non-MARKET type and no price provided', () => {
    const params = { ...validParams }
    delete params.price

    const noPriceErr = validateParams(params)
    assert.deepStrictEqual(noPriceErr.field, 'price')
    assert(_isString(noPriceErr.message))

    assert.strictEqual(validateParams({
      ...params,
      orderType: 'MARKET'
    }), null)
  })

  it('returns error if amount & sliceAmount differ in sign', () => {
    const err = validateParams({
      ...validParams,
      amount: -1
    })

    assert.deepStrictEqual(err.field, 'sliceAmount')
    assert(_isString(err.message))
  })

  it('returns error if amount is less than the minimum order size', () => {
    const err = validateParams({
      ...validParams,
      amount: 0.001
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
