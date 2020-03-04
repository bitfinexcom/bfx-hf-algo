/* eslint-env mocha */
'use strict'

const assert = require('assert')
const hasTradeRequirement = require('../../../../lib/accumulate_distribute/util/has_trade_requirement')

describe('accumulate_distribute:util:has_trade_requirement', () => {
  it('reports trade cap/offset presence', () => {
    assert.ok(hasTradeRequirement({ relativeCap: { type: 'trade' } }), 'cap presence not detected')
    assert.ok(hasTradeRequirement({ relativeOffset: { type: 'trade' } }), 'offset presence not detected')
  })

  it('reports lack of trade cap presence', () => {
    assert.ok(!hasTradeRequirement({ relativeCap: { type: '' } }), 'cap presence detected but invalid')
    assert.ok(!hasTradeRequirement({ relativeOffset: { type: null } }), 'offset presence detected but invalid')
  })
})
