/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isObject')
const submitAllOrders = require('../../../lib/host/events/submit_all_orders')

// TODO: stub for coverage results
describe('host:events:submit_all_orders', () => {
  assert.ok(_isFunction(submitAllOrders))
})
