/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const genPreview = require('../../../../lib/ping_pong/meta/gen_preview')

// TODO: stub for coverage results
describe('ping_pong:meta:gen_preview', () => {
  assert.ok(_isFunction(genPreview))
})
