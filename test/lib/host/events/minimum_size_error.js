/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isObject')
const miniumSizeError = require('../../../lib/host/events/minimum_size_error')

// TODO: stub for coverage results
describe('host:events:minimum_size_error', () => {
  assert.ok(_isFunction(miniumSizeError))
})
