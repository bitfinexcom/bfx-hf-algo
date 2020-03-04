/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const selfSubmitOrder = require('../../../../lib/ococo/events/self_submit_initial_order')

// TODO: stub for coverage results
describe('ococo:events:self_submit_initial_order', () => {
  assert.ok(_isFunction(selfSubmitOrder))
})
