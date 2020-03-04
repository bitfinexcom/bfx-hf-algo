/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const lifeStop = require('../../../../lib/ping_pong/events/life_stop')

// TODO: stub for coverage results
describe('ping_pong:events:data_trades', () => {
  assert.ok(_isFunction(lifeStop))
})
