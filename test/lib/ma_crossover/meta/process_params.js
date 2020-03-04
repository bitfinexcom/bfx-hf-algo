/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const processParams = require('../../../../lib/ma_crossover/meta/process_params')

// TODO: stub for coverage results
describe('ma_crossover:meta:process_params', () => {
  assert.ok(_isFunction(processParams))
})
