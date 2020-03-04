/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isObject')
const updateState = require('../../../lib/host/events/update_state')

// TODO: stub for coverage results
describe('host:events:update_state', () => {
  assert.ok(_isFunction(updateState))
})
