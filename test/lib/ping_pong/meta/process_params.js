/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const processParams = require('../../../../lib/ping_pong/meta/process_params')

// TODO: stub for coverage results
describe('ping_pong:meta:process_params', () => {
  assert.ok(_isFunction(processParams))
})
