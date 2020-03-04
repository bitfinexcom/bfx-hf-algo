/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const unserialize = require('../../../../lib/ma_crossover/meta/unserialize')

// TODO: stub for coverage results
describe('ma_crossover:meta:unserialize', () => {
  assert.ok(_isFunction(unserialize))
})
