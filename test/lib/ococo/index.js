/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isObject = require('lodash/isObject')
const OCOCO = require('../../../lib/ococo')

// TODO: stub for coverage results
describe('ococo', () => {
  assert.ok(_isObject(OCOCO))
})
