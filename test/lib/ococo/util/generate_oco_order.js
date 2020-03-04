/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const generateOrder = require('../../../../lib/ococo/util/generate_oco_order')

// TODO: stub for coverage results
describe('ococo:util:generate_order', () => {
  assert.ok(_isFunction(generateOrder))
})
