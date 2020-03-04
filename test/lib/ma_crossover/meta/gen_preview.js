/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const genPreview = require('../../../../lib/ma_crossover/meta/gen_preview')

// TODO: stub for coverage results
describe('ma_crossover:meta:gen_preview', () => {
  assert.ok(_isFunction(genPreview))
})
