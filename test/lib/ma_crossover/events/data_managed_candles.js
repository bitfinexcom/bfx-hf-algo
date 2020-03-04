/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const dataManagedCandles = require('../../../../lib/ma_crossover/events/data_managed_candles')

// TODO: stub for coverage results
describe('ma_crossover:events:data_managed_candles', () => {
  assert.ok(_isFunction(dataManagedCandles))
})
