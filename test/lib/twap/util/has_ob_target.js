/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const hasOBTarget = require('../../../../lib/twap/util/has_ob_target')

// TODO: stub for coverage results
describe('twap:util:has_ob_target', () => {
  assert.ok(_isFunction(hasOBTarget))
})
