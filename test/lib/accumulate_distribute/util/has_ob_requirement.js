/* eslint-env mocha */
'use strict'

const assert = require('assert')
const hasOBRequirement = require('../../../../lib/accumulate_distribute/util/has_ob_requirement')

describe('accumulate_distribute:util:has_ob_requirement', () => {
  it('reports OB cap/offset presence', () => {
    assert.ok(hasOBRequirement({ relativeCap: { type: 'bid' } }), 'cap presence not detected')
    assert.ok(hasOBRequirement({ relativeCap: { type: 'ask' } }), 'cap presence not detected')
    assert.ok(hasOBRequirement({ relativeCap: { type: 'mid' } }), 'cap presence not detected')
    assert.ok(hasOBRequirement({ relativeOffset: { type: 'bid' } }), 'offset presence not detected')
    assert.ok(hasOBRequirement({ relativeOffset: { type: 'ask' } }), 'offset presence not detected')
    assert.ok(hasOBRequirement({ relativeOffset: { type: 'mid' } }), 'offset presence not detected')
  })

  it('reports lack of OB cap presence', () => {
    assert.ok(!hasOBRequirement({ relativeCap: { type: '' } }), 'cap presence detected but invalid')
    assert.ok(!hasOBRequirement({ relativeOffset: { type: null } }), 'offset presence detected but invalid')
  })
})
