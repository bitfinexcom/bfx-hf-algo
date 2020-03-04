/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isObject')
const assignChannel = require('../../../lib/host/events/assign_channel')

// TODO: stub for coverage results
describe('host:events:assign_channel', () => {
  assert.ok(_isFunction(assignChannel))
})
