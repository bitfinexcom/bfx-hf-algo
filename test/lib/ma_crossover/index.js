/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isObject = require('lodash/isObject')
const maCrossover = require('../../../lib/ma_crossover')

// TODO: stub for coverage results
describe('ma_crossover', () => {
  assert.ok(_isObject(maCrossover))
})
