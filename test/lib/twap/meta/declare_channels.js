/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const declareChannels = require('../../../../lib/twap/meta/declare_channels')

// TODO: stub for coverage results
describe('twap:util:declare_channels', () => {
  assert.ok(_isFunction(declareChannels))
})
