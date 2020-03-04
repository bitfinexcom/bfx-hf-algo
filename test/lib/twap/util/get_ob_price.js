/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const getOBPrice = require('../../../../lib/twap/util/get_ob_price')

// TODO: stub for coverage results
describe('twap:util:get_ob_price', () => {
  assert.ok(_isFunction(getOBPrice))
})
