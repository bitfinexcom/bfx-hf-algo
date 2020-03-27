/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Config = require('../../../../lib/twap/config')
const hasOBTarget = require('../../../../lib/twap/util/has_ob_target')

const { PRICE_COND, PRICE_TARGET } = Config

describe('twap:util:has_ob_target', () => {
  it('checks if an OB price target is set', () => {
    assert.ok(hasOBTarget({ priceTarget: 1, priceCondition: PRICE_COND.MATCH_MIDPOINT }))
    assert.ok(hasOBTarget({ priceTarget: 1, priceCondition: PRICE_COND.MATCH_SIDE }))
    assert.ok(!hasOBTarget({ priceTarget: 1, priceCondition: '' }))

    assert.ok(hasOBTarget({ priceTarget: PRICE_TARGET.OB_MID }))
    assert.ok(hasOBTarget({ priceTarget: PRICE_TARGET.OB_SIDE }))
    assert.ok(!hasOBTarget({ priceTarget: '' }))
  })
})
