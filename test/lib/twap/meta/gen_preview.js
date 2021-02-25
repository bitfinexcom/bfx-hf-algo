/* eslint-env mocha */
'use strict'

const assert = require('assert')
const genPreview = require('../../../../lib/twap/meta/gen_preview')

describe('twap:meta:gen_preview', () => {
  it('sum of the amount of generated sliced orders doesn\'t exceed the total amount', () => {
    const preview = genPreview({ symbol: 'tBTCUSD', sliceAmount: 10, sliceInterval: 10000, amount: 42 })
    const sumOfSlicedAmounts = preview.filter((_, index) => index % 2 === 0).reduce((prev, curr) => prev + curr.amount, 0)

    assert.deepStrictEqual(sumOfSlicedAmounts, 42)
  })

  it('generates an estimate of potential orders with correct sliced amounts', () => {
    const preview = genPreview({ symbol: 'tBTCUSD', sliceAmount: -0.1, sliceInterval: 10000, amount: -0.3 })
    const splitAmounts = preview.filter((_, index) => index % 2 === 0).map(o => o.amount)

    assert.deepStrictEqual(preview.length, 5)
    assert.deepStrictEqual(splitAmounts, [-0.1, -0.1, -0.1])
  })
})
