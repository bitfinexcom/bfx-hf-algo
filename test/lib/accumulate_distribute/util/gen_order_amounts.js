/* eslint-env mocha */
'use strict'

const assert = require('assert')
const { Config } = require('bfx-api-node-core')
const genOrderAmounts = require('../../../../lib/accumulate_distribute/util/gen_order_amounts')

const { DUST } = Config

describe('accumulate_distribute:util:gen_order_amounts', () => {
  it('returns a total amount equal to or DUST-difference from the requested total', () => {
    const amounts = genOrderAmounts.gen({ amount: 10, sliceAmount: 1, amountDistortion: 0.25 })
    const total = amounts.reduce((prev, curr) => prev + curr, 0)

    assert.ok(Math.abs(total - 10) <= DUST, 'deviation greater than DUST')
  })
})
