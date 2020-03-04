/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const genPreview = require('../../../../lib/ococo/meta/gen_preview')

// TODO: stub for coverage results
describe('ococo:meta:gen_preview', () => {
  assert.ok(_isFunction(genPreview))
})
