/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isObject')
const stop = require('../../../lib/host/events/stop')

// TODO: stub for coverage results
describe('host:events:stop', () => {
  assert.ok(_isFunction(stop))
})
