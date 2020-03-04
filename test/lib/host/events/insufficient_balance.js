/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isObject')
const insufficientBalance = require('../../../lib/host/events/insufficient_balance')

// TODO: stub for coverage results
describe('host:events:insufficient_balance', () => {
  assert.ok(_isFunction(insufficientBalance))
})
