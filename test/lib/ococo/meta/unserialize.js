/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const unserialize = require('../../../../lib/ococo/meta/unserialize')

// TODO: stub for coverage results
describe('ococo:meta:unserialize', () => {
  assert.ok(_isFunction(unserialize))
})
