/* eslint-env mocha */
'use strict'

const assert = require('assert')
const hasIndicatorOffset = require('../../../../lib/accumulate_distribute/util/has_indicator_offset')

describe('accumulate_distribute:util:has_indicator_offset', () => {
  it('reports offset presence', () => {
    assert.ok(hasIndicatorOffset({ relativeOffset: { type: 'sma' } }), 'offset presence not detected')
    assert.ok(hasIndicatorOffset({ relativeOffset: { type: 'ema' } }), 'offset presence not detected')
  })

  it('reports lack of offset presence', () => {
    assert.ok(!hasIndicatorOffset({ relativeOffset: { type: '' } }), 'offset presence detected but invalid')
    assert.ok(!hasIndicatorOffset({ relativeOffset: { type: null } }), 'offset presence detected but invalid')
  })
})
