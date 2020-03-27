/* eslint-env mocha */
'use strict'

const { TIME_FRAMES } = require('bfx-hf-util')
const getUIDef = require('../../../../lib/ma_crossover/meta/get_ui_def')
const testUIDef = require('../../../util/test_ui_def')

describe('ma_crossover:meta:get_ui_def', () => {
  it('returns a generator that gives an object with valid sections for the UI', () => {
    testUIDef(getUIDef({
      timeframes: Object.values(TIME_FRAMES)
    }))
  })
})
