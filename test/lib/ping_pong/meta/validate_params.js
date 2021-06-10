/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isString = require('lodash/isString')
const validateParams = require('../../../../lib/ping_pong/meta/validate_params')

const params = {
  action: 'Buy',
  orderCount: 1,
  pingAmount: 10,
  pongAmount: 10,
  pingMaxPrice: 500,
  pingMinPrice: 400,
  pingPrice: 1400,
  pongPrice: 1500,
  pongDistance: 10
}

const pairConfig = {
  minSize: 0.01,
  maxSize: 20,
  lev: 5
}

describe('ping_pong:meta:validate_params', () => {
  it('returns error if order count is invalid', () => {
    const err = validateParams({ ...params, orderCount: 'nope' })
    assert.deepStrictEqual(err.field, 'orderCount')
    assert(_isString(err.message))
  })

  it('returns error when ping amount is invalid or zero', () => {
    const invalidErr = validateParams({ ...params, pingAmount: 'not' })
    assert.deepStrictEqual(invalidErr.field, 'amount')
    assert(_isString(invalidErr.message))

    const zeroErr = validateParams({ ...params, splitPingPongAmount: true, pingAmount: 0 })
    assert.deepStrictEqual(zeroErr.field, 'pingAmount')
    assert(_isString(zeroErr.message))
  })

  it('returns error when pong amount is invalid or zero', () => {
    const invalidErr = validateParams({ ...params, pongAmount: 'not' })
    assert.deepStrictEqual(invalidErr.field, 'amount')
    assert(_isString(invalidErr.message))

    const zeroErr = validateParams({ ...params, splitPingPongAmount: true, pongAmount: 0 })
    assert.deepStrictEqual(zeroErr.field, 'pongAmount')
    assert(_isString(zeroErr.message))
  })

  describe('validate parameters when order count is 1', () => {
    it('returns error when ping price is invalid or zero', () => {
      const invalidErr = validateParams({ ...params, pingPrice: 'not' })
      assert.deepStrictEqual(invalidErr.field, 'pingPrice')
      assert(_isString(invalidErr.message))

      const zeroErr = validateParams({ ...params, pingPrice: 0 })
      assert.deepStrictEqual(zeroErr.field, 'pingPrice')
      assert(_isString(zeroErr.message))
    })

    it('returns error when pong price is invalid or zero', () => {
      const invalidErr = validateParams({ ...params, pongPrice: 'not' })
      assert.deepStrictEqual(invalidErr.field, 'pongPrice')
      assert(_isString(invalidErr.message))

      const zeroErr = validateParams({ ...params, pongPrice: 0 })
      assert.deepStrictEqual(zeroErr.field, 'pongPrice')
      assert(_isString(zeroErr.message))
    })

    it('returns error when pong price is less than ping price for buy order', () => {
      const err = validateParams({ ...params, pingPrice: 1500, pongPrice: 1300 })
      assert.deepStrictEqual(err.field, 'pongPrice')
      assert(_isString(err.message))
    })

    it('returns error when pong price is greater than ping price for sell order', () => {
      const err = validateParams({ ...params, pingAmount: -10, action: 'Sell' })
      assert.deepStrictEqual(err.field, 'pongPrice')
      assert(_isString(err.message))
    })
  })

  describe('validate parameters when order count is greater than 1', () => {
    it('returns error when minimum ping price is invalid or zero', () => {
      const invalidErr = validateParams({ ...params, orderCount: 2, pingMinPrice: 'not' })
      assert.deepStrictEqual(invalidErr.field, 'pingMinPrice')
      assert(_isString(invalidErr.message))

      const zeroErr = validateParams({ ...params, orderCount: 2, pingMinPrice: 0 })
      assert.deepStrictEqual(zeroErr.field, 'pingMinPrice')
      assert(_isString(zeroErr.message))
    })

    it('returns error when maximum ping price is invalid or zero', () => {
      const invalidErr = validateParams({ ...params, orderCount: 2, pingMaxPrice: 'not' })
      assert.deepStrictEqual(invalidErr.field, 'pingMaxPrice')
      assert(_isString(invalidErr.message))

      const zeroErr = validateParams({ ...params, orderCount: 2, pingMaxPrice: 0 })
      assert.deepStrictEqual(zeroErr.field, 'pingMaxPrice')
      assert(_isString(zeroErr.message))
    })

    it('returns error when pong distance is invalid, zero or negative', () => {
      const invalidErr = validateParams({ ...params, orderCount: 2, pongDistance: 'not' })
      assert.deepStrictEqual(invalidErr.field, 'pongDistance')
      assert(_isString(invalidErr.message))

      const zeroErr = validateParams({ ...params, orderCount: 2, pongDistance: 0 })
      assert.deepStrictEqual(zeroErr.field, 'pongDistance')
      assert(_isString(zeroErr.message))

      const negativeErr = validateParams({ ...params, orderCount: 2, pongDistance: -10 })
      assert.deepStrictEqual(negativeErr.field, 'pongDistance')
      assert(_isString(negativeErr.message))
    })

    it('returns error when minimum ping price is greater than the maximum ping price', () => {
      const err = validateParams({ ...params, orderCount: 2, pingMinPrice: 1000, pingMaxPrice: 800 })
      assert.deepStrictEqual(err.field, 'pingMaxPrice')
      assert(_isString(err.message))
    })
  })

  describe('validate ping amount against minimum and maximum order size', () => {
    it('returns error if ping amount is less than the minimum order size', () => {
      const err = validateParams({ ...params, pingAmount: 0.001 }, pairConfig)
      assert.deepStrictEqual(err.field, 'amount')
      assert(_isString(err.message))
    })

    it('returns error if ping amount is greater than the maximum order size', () => {
      const err = validateParams({ ...params, splitPingPongAmount: true, pingAmount: 25 }, pairConfig)
      assert.deepStrictEqual(err.field, 'pingAmount')
      assert(_isString(err.message))
    })
  })

  describe('validate pong amount against minimum and maximum order size', () => {
    it('returns error if pong amount is less than the minimum order size', () => {
      const err = validateParams({ ...params, pongAmount: 0.001 }, pairConfig)
      assert.deepStrictEqual(err.field, 'amount')
      assert(_isString(err.message))
    })

    it('returns error if pong amount is greater than the maximum order size', () => {
      const err = validateParams({ ...params, splitPingPongAmount: true, pongAmount: 25 }, pairConfig)
      assert.deepStrictEqual(err.field, 'pongAmount')
      assert(_isString(err.message))
    })
  })

  describe('validate leverage for future pairs', () => {
    it('returns error if leverage is not a number', () => {
      const err = validateParams({ ...params, _futures: true, lev: '' }, pairConfig)
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
