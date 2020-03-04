/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const declareEvents = require('../../../../lib/ococo/meta/declare_events')

// TODO: stub for coverage results
describe('ococo:meta:declare_events', () => {
  assert.ok(_isFunction(declareEvents))
})
