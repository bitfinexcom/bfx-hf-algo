/* eslint-env mocha */
'use strict'

const getUIDef = require('../../../../lib/accumulate_distribute/meta/get_ui_def')
const testUIDef = require('../../../util/test_ui_def')

describe('accumulate_distribute:meta:get_ui_def', () => {
  it('returns a generator that gives an object with valid sections for the UI', () => {
    testUIDef(getUIDef())
  })
})
