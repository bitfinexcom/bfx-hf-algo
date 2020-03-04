/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const lifeStart = require('../../../../lib/ococo/events/life_start')

// TODO: stub for coverage results
describe('ococo:events:life_start', () => {
  assert.ok(_isFunction(lifeStart))
})
