/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const aoHost = require('../../lib/ao_host')

// TODO: stub for coverage results
describe('aoHost', () => {
  assert.ok(_isFunction(aoHost))
})
