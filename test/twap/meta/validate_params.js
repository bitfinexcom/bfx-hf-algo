/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isString = require('lodash/isString')
const validateParams = require('../../../lib/twap/meta/validate_params')

const validParams = {
  orderType: 'LIMIT',
  amount: 1,
  sliceAmount: 0.1,
  sliceInterval: 1,
  submitDelay: 100,
  cancelDelay: 100,
  priceTarget: 1000,
  priceCondition: 'MATCH_LAST'
}

describe('twap:meta:validate_params', () => {
  it('returns no error on valid params', () => {
    assert.strictEqual(validateParams(validParams), null)
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

  it('returns error on invalid or negative slice interval', () => {
    assert(_isString(validateParams({
      ...validParams,
      sliceInterval: 'nope'
    })))

    assert(_isString(validateParams({
      ...validParams,
      sliceInterval: -100
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

  it('returns error if amount & sliceAmount differ in sign', () => {
    assert(_isString(validateParams({
      ...validParams,
      amount: -1
    })))
  })

  it('returns error on non-numeric and non-string price target', () => {
    assert(_isString(validateParams({
      ...validParams,
      priceTarget: { nope: 42 }
    })))
  })

  it('returns error on negative explicit price target', () => {
    assert(_isString(validateParams({
      ...validParams,
      priceTarget: -1
    })))
  })

  it('returns error on numeric price target with invalid price condition', () => {
    assert(_isString(validateParams({
      ...validParams,
      priceTarget: 100,
      priceCondition: 'nope'
    })))
  })

  it('returns error on conditional price target with invalid condition', () => {
    assert(_isString(validateParams({
      ...validParams,
      priceTarget: 'nope'
    })))
  })

  it('returns error on non-numeric price delta if provided', () => {
    assert(_isString(validateParams({
      ...validParams,
      priceDelta: 'nope'
    })))
  })
})
