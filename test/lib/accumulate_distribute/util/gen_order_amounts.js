/* eslint-env mocha */
'use strict'

const assert = require('assert')
const { Config } = require('bfx-api-node-core')
const { gen: genOrderAmounts } = require('../../../../lib/accumulate_distribute/util/gen_order_amounts')

const { DUST } = Config

const pairConfig = {
  minSize: 0.002,
  maxSize: 0.004
}

describe('accumulate_distribute:util:gen_order_amounts', () => {
  it('returns a total amount equal to or DUST-difference from the requested total', () => {
    const amounts = genOrderAmounts({ amount: 10, sliceAmount: 1, amountDistortion: 0.25 })
    const total = amounts.reduce((prev, curr) => prev + curr, 0)

    assert.ok(Math.abs(total - 10) <= DUST, 'deviation greater than DUST')
  })

  describe('when pairConfig is provided', () => {
    it('returns a total amount equal to or DUST-difference from the requested total for buy order', () => {
      const amounts = genOrderAmounts({ amount: 10, sliceAmount: 1, amountDistortion: 0.25 }, pairConfig)
      const total = amounts.reduce((prev, curr) => prev + curr, 0)

      assert.ok(Math.abs(total - 10) <= DUST, 'deviation greater than DUST')
    })

    it('returns a total amount equal to or DUST-difference from the requested total for sell order', () => {
      const amounts = genOrderAmounts({ amount: -10, sliceAmount: -1, amountDistortion: 0.25 }, pairConfig)
      const total = amounts.reduce((prev, curr) => prev + curr, 0)

      assert.ok(Math.abs(total + 10) <= DUST, 'deviation greater than DUST')
    })

    it('leaves out the remaining amount if the maximum possible total amount is less than the input amount', () => {
      const amounts = genOrderAmounts({ amount: 0.0051, sliceAmount: 0.002, amountDistortion: 0.25 }, pairConfig)
      const total = amounts.reduce((prev, curr) => prev + curr, 0)

      assert.ok(Math.abs(total - 0.0051) < pairConfig.minSize, 'deviation greater than minimum order size')
    })

    it('does not generate the sliced order amount less than the minimum size', () => {
      const amounts = genOrderAmounts({ amount: 0.005, sliceAmount: 0.002, amountDistortion: 0.25 }, pairConfig)
      const filteredOutAmounts = amounts.filter(v => v < pairConfig.minSize)

      assert.deepStrictEqual(filteredOutAmounts.length, 0, 'contains amounts less than the minimum order size')
    })

    it('does not generate the sliced order amount greater than the maximum size', () => {
      const amounts = genOrderAmounts({ amount: 0.1, sliceAmount: 0.004, amountDistortion: 0.25 }, pairConfig)
      const filteredOutAmounts = amounts.filter(v => v > pairConfig.maxSize)

      assert.deepStrictEqual(filteredOutAmounts.length, 0, 'contains amounts greater than the maximum order size')
    })
  })
})
