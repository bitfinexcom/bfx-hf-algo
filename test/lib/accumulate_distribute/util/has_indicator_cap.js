/* eslint-env mocha */
'use strict'

const assert = require('assert')
const hasIndicatorCap = require('../../../../lib/accumulate_distribute/util/has_indicator_cap')

describe('accumulate_distribute:util:has_indicator_cap', () => {
  it('reports cap presence', () => {
    assert.ok(hasIndicatorCap({ relativeCap: { type: 'ma' } }), 'cap presence not detected')
    assert.ok(hasIndicatorCap({ relativeCap: { type: 'ema' } }), 'cap presence not detected')
  })

  it('reports lack of cap presence', () => {
    assert.ok(!hasIndicatorCap({ relativeCap: { type: '' } }), 'cap presence detected but invalid')
    assert.ok(!hasIndicatorCap({ relativeCap: { type: null } }), 'cap presence detected but invalid')
  })
})
