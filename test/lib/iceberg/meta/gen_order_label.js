/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isObject')
const genOrderLabel = require('../../../lib/iceberg/meta/gen_order_label')

// TODO: stub for coverage results
describe('host:iceberg:meta:gen_order_label', () => {
  assert.ok(_isFunction(genOrderLabel))
})
