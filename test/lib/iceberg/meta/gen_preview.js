/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isObject')
const genPreview = require('../../../lib/iceberg/meta/gen_preview')

// TODO: stub for coverage results
describe('host:iceberg:meta:gen_preview', () => {
  assert.ok(_isFunction(genPreview))
})
