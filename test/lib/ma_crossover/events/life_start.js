/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const lifeStart = require('../../../../lib/ma_crossover/events/life_start')

// TODO: stub for coverage results
describe('ma_crossover:events:data_trades', () => {
  assert.ok(_isFunction(lifeStart))
})
