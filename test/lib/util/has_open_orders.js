/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const hasOpenOrders = require('../../../lib/util/has_open_orders')

// TODO: stub for coverage results
describe('hasOpenOrders', () => {
  assert.ok(_isFunction(hasOpenOrders))
})
