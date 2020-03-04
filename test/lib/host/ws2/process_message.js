/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isObject')
const processMessage = require('../../../lib/host/ws2/process_message')

// TODO: stub for coverage results
describe('host:ws2:process_message', () => {
  assert.ok(_isFunction(processMessage))
})
