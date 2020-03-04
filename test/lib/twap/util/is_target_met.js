/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const isTargetMet = require('../../../../lib/twap/util/is_target_met')

// TODO: stub for coverage results
describe('twap:util:is_target_met', () => {
  assert.ok(_isFunction(isTargetMet))
})
