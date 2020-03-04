/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isObject')
const withAOUpdate = require('../../../lib/host/with_ao_update')

// TODO: stub for coverage results
describe('host:with_ao_update', () => {
  assert.ok(_isFunction(withAOUpdate))
})
