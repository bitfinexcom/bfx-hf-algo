/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isObject')
const initAOState = require('../../../lib/host/init_ao_state')

// TODO: stub for coverage results
describe('host:init_ao_state', () => {
  assert.ok(_isFunction(initAOState))
})
