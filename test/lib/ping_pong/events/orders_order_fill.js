/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const ordersOrderFill = require('../../../../lib/ping_pong/events/orders_order_fill')

// TODO: stub for coverage results
describe('ping_pong:events:orders_order_fill', () => {
  assert.ok(_isFunction(ordersOrderFill))
})
