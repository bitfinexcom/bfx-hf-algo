/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const initState = require('../../../../lib/ococo/meta/init_state')

// TODO: stub for coverage results
describe('ococo:meta:init_state', () => {
  assert.ok(_isFunction(initState))
})
