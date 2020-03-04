/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const genPreview = require('../../../../lib/twap/meta/gen_preview')

// TODO: stub for coverage results
describe('twap:util:gen_preview', () => {
  assert.ok(_isFunction(genPreview))
})
