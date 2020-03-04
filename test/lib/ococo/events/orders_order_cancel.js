/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const ordersOrderCancel = require('../../../../lib/ococo/events/orders_order_cancel')

// TODO: stub for coverage results
describe('ococo:events:orders_order_cancel', () => {
  assert.ok(_isFunction(ordersOrderCancel))
})
