/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const unserialize = require('../../../../lib/ping_pong/meta/unserialize')

// TODO: stub for coverage results
describe('ping_pong:meta:unserialize', () => {
  assert.ok(_isFunction(unserialize))
})
