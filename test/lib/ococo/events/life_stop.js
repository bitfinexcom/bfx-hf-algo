/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const lifeStop = require('../../../../lib/ococo/events/life_stop')

// TODO: stub for coverage results
describe('ococo:events:life_stop', () => {
  assert.ok(_isFunction(lifeStop))
})
