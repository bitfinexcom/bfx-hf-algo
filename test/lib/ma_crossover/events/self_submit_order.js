/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const selfSubmitOrder = require('../../../../lib/ma_crossover/events/self_submit_order')

// TODO: stub for coverage results
describe('ma_crossover:events:self_interval_tick', () => {
  assert.ok(_isFunction(selfSubmitOrder))
})
