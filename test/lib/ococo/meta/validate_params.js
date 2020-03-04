/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const validateParams = require('../../../../lib/ococo/meta/validate_params')

// TODO: stub for coverage results
describe('ococo:meta:unserialize', () => {
  assert.ok(_isFunction(validateParams))
})
