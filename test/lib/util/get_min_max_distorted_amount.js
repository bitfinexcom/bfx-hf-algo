/* eslint-env mocha */
'use strict'

const assert = require('assert')
const getMinMaxDistortedAmount = require('../../../lib/util/get_min_max_distorted_amount')

const pairConfig = {
  minSize: 0.006,
  maxSize: 100
}

describe('util:get_min_max_distorted_amount', () => {
  it('should return distorted amounts equal to the minimum order size', () => {
    const orderParams = { amount: 0.1, sliceAmount: 0.001, amountDistortion: 0.25 }
    const { minDistortedAmount, maxDistortedAmount } = getMinMaxDistortedAmount(orderParams, pairConfig)

    assert.deepStrictEqual(minDistortedAmount, 0.006, 'should have equalled to minimum order size')
    assert.deepStrictEqual(maxDistortedAmount, 0.006, 'should have equalled to minimum order size')
  })

  it('should return distorted amounts equal to the maximum order size', () => {
    const orderParams = { amount: -200, sliceAmount: -150, amountDistortion: 0.25 } // sell order
    const { minDistortedAmount, maxDistortedAmount } = getMinMaxDistortedAmount(orderParams, pairConfig)

    assert.deepStrictEqual(minDistortedAmount, -100, 'should have equalled to maximum order size')
    assert.deepStrictEqual(maxDistortedAmount, -100, 'should have equalled to maximum order size')
  })

  it('returns the distorted amounts properly', () => {
    const orderParams = { amount: 10, sliceAmount: 1, amountDistortion: 0.25 }
    const { minDistortedAmount, maxDistortedAmount } = getMinMaxDistortedAmount(orderParams, pairConfig)

    assert.deepStrictEqual(minDistortedAmount, 0.75, 'should have distorted to minimum possible slice amount')
    assert.deepStrictEqual(maxDistortedAmount, 1.25, 'should have distorted to maximum possible slice amount')
  })
})
