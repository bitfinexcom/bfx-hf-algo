/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const hasTradeTarget = require('../../../../lib/twap/util/has_trade_target')

// TODO: stub for coverage results
describe('twap:util:has_trade_target', () => {
  assert.ok(_isFunction(hasTradeTarget))
})
