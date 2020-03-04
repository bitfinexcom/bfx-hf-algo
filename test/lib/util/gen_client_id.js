/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const genClientID = require('../../../lib/util/gen_client_id')

// TODO: stub for coverage results
describe('genClientID', () => {
  assert.ok(_isFunction(genClientID))
})
