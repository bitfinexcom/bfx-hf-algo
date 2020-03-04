/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const processParams = require('../../../../lib/ococo/meta/process_params')

// TODO: stub for coverage results
describe('ococo:meta:process_params', () => {
  assert.ok(_isFunction(processParams))
})
