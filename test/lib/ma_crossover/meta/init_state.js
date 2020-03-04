/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const initState = require('../../../../lib/ma_crossover/meta/init_state')

// TODO: stub for coverage results
describe('ma_crossover:meta:init_state', () => {
  assert.ok(_isFunction(initState))
})
