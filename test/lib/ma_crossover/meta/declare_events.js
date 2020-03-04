/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const declareEvents = require('../../../../lib/ma_crossover/meta/declare_events')

// TODO: stub for coverage results
describe('ma_crossover:meta:declare_events', () => {
  assert.ok(_isFunction(declareEvents))
})
