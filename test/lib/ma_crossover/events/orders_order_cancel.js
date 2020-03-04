/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const ordersOrderCancel = require('../../../../lib/ma_crossover/events/orders_order_cancel')

// TODO: stub for coverage results
describe('ma_crossover:events:orders_order_cancel', () => {
  assert.ok(_isFunction(ordersOrderCancel))
})
