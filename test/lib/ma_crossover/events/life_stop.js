/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const lifeStop = require('../../../../lib/ma_crossover/events/life_stop')

// TODO: stub for coverage results
describe('ma_crossover:events:data_trades', () => {
  assert.ok(_isFunction(lifeStop))
})
