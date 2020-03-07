/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isEmpty = require('lodash/isEmpty')
const validateParams = require('../../../../lib/ococo/meta/validate_params')

const params = {
  orderType: 'LIMIT',
  orderPrice: 1,
  amount: 6,
  submitDelay: 0,
  cancelDelay: 0,

  limitPrice: 6,
  stopPrice: 6,
  ocoAmount: 6,

  action: 'Buy',

  _futures: false,
  lev: 3.3
}

describe('ococo:meta:unserialize', () => {
  it('validates params correctly', () => {
    assert.ok(!_isEmpty(validateParams({ ...params, orderType: '' })))
    assert.ok(!_isEmpty(validateParams({ ...params, orderType: 'LIMIT', ordePrice: null })))
    assert.ok(!_isEmpty(validateParams({ ...params, amount: '' })))
    assert.ok(!_isEmpty(validateParams({ ...params, submitDelay: '' })))
    assert.ok(!_isEmpty(validateParams({ ...params, submitDelay: -1 })))
    assert.ok(!_isEmpty(validateParams({ ...params, cancelDelay: '' })))
    assert.ok(!_isEmpty(validateParams({ ...params, cancelDelay: -1 })))
    assert.ok(!_isEmpty(validateParams({ ...params, limitPrice: '' })))
    assert.ok(!_isEmpty(validateParams({ ...params, stopPrice: '' })))
    assert.ok(!_isEmpty(validateParams({ ...params, ocoAmount: '' })))
    assert.ok(!_isEmpty(validateParams({ ...params, action: 'none' })))
    assert.ok(!_isEmpty(validateParams({ ...params, ocoAction: 'none' })))
    assert.ok(!_isEmpty(validateParams({ ...params, _futures: true, lev: null })))
    assert.ok(!_isEmpty(validateParams({ ...params, _futures: true, lev: 0 })))
    assert.ok(!_isEmpty(validateParams({ ...params, _futures: true, lev: 101 })))
  })
})
