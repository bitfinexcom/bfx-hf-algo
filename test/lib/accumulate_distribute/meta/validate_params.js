/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isEmpty = require('lodash/isEmpty')
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
  awaitFill: true,
  lev: 3.3,
  _futures: true
}

describe('accumulate_distribute:meta:unserialize', () => {
  it('returns an error string for invalid parameters', () => {
    assert.ok(!_isEmpty(validateParams({ ...params, orderType: 'unknown' })))
    assert.ok(!_isEmpty(validateParams({ ...params, amount: 'not' })))
    assert.ok(!_isEmpty(validateParams({ ...params, amount: 1, sliceAmount: -1 })))
    assert.ok(!_isEmpty(validateParams({ ...params, amount: -1, sliceAmount: 1 })))
    assert.ok(!_isEmpty(validateParams({ ...params, lev: '' })))
    assert.ok(!_isEmpty(validateParams({ ...params, lev: 0 })))
    assert.ok(!_isEmpty(validateParams({ ...params, lev: 101 })))
    assert.ok(!_isEmpty(validateParams({ ...params, sliceAmount: 'not' })))
    assert.ok(!_isEmpty(validateParams({ ...params, catchUp: 'day' })))
    assert.ok(!_isEmpty(validateParams({ ...params, awaitFill: 'and' })))
    assert.ok(!_isEmpty(validateParams({ ...params, sliceInterval: 'it' })))
    assert.ok(!_isEmpty(validateParams({ ...params, sliceInterval: -1 })))
    assert.ok(!_isEmpty(validateParams({ ...params, intervalDistortion: 'does\'t' })))
    assert.ok(!_isEmpty(validateParams({ ...params, amountDistortion: 'stop' })))
    assert.ok(!_isEmpty(validateParams({ ...params, orderType: 'LIMIT', limitPrice: 'nope' })))

    assert.ok(!_isEmpty(validateParams({ ...params, relativeCap: { ...params.relativeCap, delta: '' } })))
    assert.ok(!_isEmpty(validateParams({ ...params, relativeCap: { ...params.relativeCap, candlePrice: false } })))
    assert.ok(!_isEmpty(validateParams({ ...params, relativeCap: { ...params.relativeCap, candleTimeFrame: '' } })))
    assert.ok(!_isEmpty(validateParams({ ...params, relativeCap: { ...params.relativeCap, args: ['nope'] } })))

    assert.ok(!_isEmpty(validateParams({ ...params, relativeOffset: { ...params.relativeOffset, delta: '' } })))
    assert.ok(!_isEmpty(validateParams({ ...params, relativeOffset: { ...params.relativeOffset, candlePrice: false } })))
    assert.ok(!_isEmpty(validateParams({ ...params, relativeOffset: { ...params.relativeOffset, candleTimeFrame: '' } })))
    assert.ok(!_isEmpty(validateParams({ ...params, relativeOffset: { ...params.relativeOffset, args: ['nope'] } })))
  })
})
