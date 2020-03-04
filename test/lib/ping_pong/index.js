/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isObject = require('lodash/isObject')
const pingPong = require('../../../lib/ping_pong')

// TODO: stub for coverage results
describe('ping_pong', () => {
  assert.ok(_isObject(pingPong))
})
