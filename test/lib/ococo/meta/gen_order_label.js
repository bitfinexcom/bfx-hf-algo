/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const genOrderLabel = require('../../../../lib/ococo/meta/gen_order_label')

// TODO: stub for coverage results
describe('ococo:meta:gen_order_label', () => {
  assert.ok(_isFunction(genOrderLabel))
})
