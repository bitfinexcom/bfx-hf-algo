/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const ordersOrderCancel = require('../../../../lib/ping_pong/events/orders_order_cancel')

// TODO: stub for coverage results
describe('ping_pong:events:orders_order_cancel', () => {
  assert.ok(_isFunction(ordersOrderCancel))
})
