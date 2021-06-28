/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isObject = require('lodash/isObject')
const confirmOrderSubmit = require('../../../../lib/accumulate_distribute/meta/confirm_order_submit')

const pairConfig = { minSize: 0.002, maxSize: 0.004 }

describe('accumulate_distribute:meta:confirm_order_submit', () => {
  it('returns null if generating total order amount is possible', () => {
    const orderParams = { amount: 10, sliceAmount: 1, amountDistortion: 0.25 }

    const confirmResp = confirmOrderSubmit(orderParams, pairConfig)
    assert.ok(!_isObject(confirmResp), 'should have returned null')
  })

  it('does not return null if generating total order amount is possible', () => {
    const orderParams = { amount: 0.0051, sliceAmount: 0.002, amountDistortion: 0.25 }

    const confirmResp = confirmOrderSubmit(orderParams, pairConfig)
    assert.ok(_isObject(confirmResp), 'should not have returned null')
  })
})
