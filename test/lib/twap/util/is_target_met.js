/* eslint-env mocha */
'use strict'

const assert = require('assert')
const isTargetMet = require('../../../../lib/twap/util/is_target_met')

describe('twap:util:is_target_met', () => {
  it('verifies that the price target is met', () => {
    assert.ok(isTargetMet({ priceTarget: 1, priceDelta: 0 }, 1))
    assert.ok(isTargetMet({ priceTarget: 1, priceDelta: 0.2 }, 1.2))
    assert.ok(!isTargetMet({ priceTarget: 1, priceDelta: 0.2 }, 1.3))
  })
})
