/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const initState = require('../../../../lib/ping_pong/meta/init_state')

// TODO: stub for coverage results
describe('ping_pong:meta:init_state', () => {
  assert.ok(_isFunction(initState))
})
