/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isObject')
const notify = require('../../../lib/host/events/notify')

// TODO: stub for coverage results
describe('host:events:notify', () => {
  assert.ok(_isFunction(notify))
})
