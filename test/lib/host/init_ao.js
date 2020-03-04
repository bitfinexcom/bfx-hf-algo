/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isObject')
const initAO = require('../../../lib/host/init_ao')

// TODO: stub for coverage results
describe('host:init_ao', () => {
  assert.ok(_isFunction(initAO))
})
