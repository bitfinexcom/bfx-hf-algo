/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isObject = require('lodash/isObject')
const twap = require('../../../lib/twap')

// TODO: stub for coverage results
describe('twap', () => {
  assert.ok(_isObject(twap))
})
