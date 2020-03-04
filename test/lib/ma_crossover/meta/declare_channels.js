/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const declareChannels = require('../../../../lib/ma_crossover/meta/declare_channels')

// TODO: stub for coverage results
describe('ma_crossover:meta:declare_channels', () => {
  assert.ok(_isFunction(declareChannels))
})
