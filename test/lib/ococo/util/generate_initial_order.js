/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const generateInitialOrder = require('../../../../lib/ococo/util/generate_initial_order')

// TODO: stub for coverage results
describe('ococo:util:generate_initial_order', () => {
  assert.ok(_isFunction(generateInitialOrder))
})
