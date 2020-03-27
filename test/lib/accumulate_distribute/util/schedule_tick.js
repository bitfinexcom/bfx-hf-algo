/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const { tick } = require('../../../../lib/accumulate_distribute/util/schedule_tick')

// TODO: stub for coverage results
describe.skip('accumulate_distribute:util:schedule_tick', () => {
  assert.ok(_isFunction(tick))
})
