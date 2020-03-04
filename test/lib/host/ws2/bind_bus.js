/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isObject')
const bindBus = require('../../../lib/host/ws2/bind_bus')

// TODO: stub for coverage results
describe('host:ws2:bind_bus', () => {
  assert.ok(_isFunction(bindBus))
})
