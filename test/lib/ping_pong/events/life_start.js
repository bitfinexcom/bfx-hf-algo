/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const lifeStart = require('../../../../lib/ping_pong/events/life_start')

// TODO: stub for coverage results
describe('ping_pong:events:data_trades', () => {
  assert.ok(_isFunction(lifeStart))
})
