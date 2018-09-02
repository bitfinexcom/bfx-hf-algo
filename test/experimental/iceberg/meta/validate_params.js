/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isString = require('lodash/isString')
const validateParams = require('experimental/iceberg/meta/validate_params')

const validParams = {
  price: 1000,
  orderType: 'LIMIT',
  amount: 1,
  sliceAmount: 0.1,
  submitDelay: 100,
  cancelDelay: 100
}

describe('iceberg:meta:validate_params', () => {
  it('returns no error on valid params', () => {
    assert.equal(validateParams(validParams), null)
  })

  it('returns error on invalid order type', () => {
    assert(_isString(validateParams({
      ...validParams,
      orderType: 'nope'
    })))
  })

  it('returns error on invalid amount', () => {
    assert(_isString(validateParams({
      ...validParams,
      amount: 'nope'
    })))
  })

  it('returns error on invalid slice amount', () => {
    assert(_isString(validateParams({
      ...validParams,
      sliceAmount: 'nope'
    })))
  })

  it('returns error on invalid or negative submit delay', () => {
    assert(_isString(validateParams({
      ...validParams,
      submitDelay: 'nope'
    })))

    assert(_isString(validateParams({
      ...validParams,
      submitDelay: -100
    })))
  })

  it('returns error on invalid or negative cancel delay', () => {
    assert(_isString(validateParams({
      ...validParams,
      cancelDelay: 'nope'
    })))

    assert(_isString(validateParams({
      ...validParams,
      cancelDelay: -100
    })))
  })

  it('returns error if non-MARKET type and no price provided', () => {
    const params = { ...validParams }
    delete params.price
    assert(_isString(validateParams(params)))

    assert.equal(validateParams({
      ...params,
      orderType: 'MARKET'
    }), null)
  })

  it('returns error if amount & sliceAmount differ in sign', () => {
    assert(_isString(validateParams({
      ...validParams,
      amount: -1
    })))
  })
})
