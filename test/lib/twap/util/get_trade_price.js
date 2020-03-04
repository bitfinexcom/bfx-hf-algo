/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const getTradePrice = require('../../../../lib/twap/util/get_trade_price')

// TODO: stub for coverage results
describe('twap:util:get_trade_price', () => {
  assert.ok(_isFunction(getTradePrice))
})
