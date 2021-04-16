/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isEmpty = require('lodash/isEmpty')
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

describe('ma_crossover:meta:unserialize', () => {
  it('validates', () => {
    assert.ok(!_isEmpty(validateParams({ ...params, orderType: '' })))
    assert.ok(!_isEmpty(validateParams({ ...params, amount: '' })))
    assert.ok(!_isEmpty(validateParams({ ...params, orderPrice: '' })))

    assert.ok(!_isEmpty(validateParams({ ...params, long: '' })))
    assert.ok(!_isEmpty(validateParams({ ...params, long: { ...params.long, args: [] } })))
    assert.ok(!_isEmpty(validateParams({ ...params, long: { ...params.long, args: [''] } })))
    assert.ok(!_isEmpty(validateParams({ ...params, long: { ...params.long, candlePrice: null } })))
    assert.ok(!_isEmpty(validateParams({ ...params, long: { ...params.long, candleTimeFrame: null } })))

    assert.ok(!_isEmpty(validateParams({ ...params, short: '' })))
    assert.ok(!_isEmpty(validateParams({ ...params, short: { ...params.short, args: [] } })))
    assert.ok(!_isEmpty(validateParams({ ...params, short: { ...params.short, args: [''] } })))
    assert.ok(!_isEmpty(validateParams({ ...params, short: { ...params.short, candlePrice: null } })))
    assert.ok(!_isEmpty(validateParams({ ...params, short: { ...params.short, candleTimeFrame: null } })))

    assert.ok(!_isEmpty(validateParams({ ...params, _futures: true, lev: null })))
    assert.ok(!_isEmpty(validateParams({ ...params, _futures: true, lev: 0 })))
    assert.ok(!_isEmpty(validateParams({ ...params, _futures: true, lev: 101 })))
  })
})
