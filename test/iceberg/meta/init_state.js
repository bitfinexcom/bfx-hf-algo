/* eslint-env mocha */
'use strict'

const assert = require('assert')
const initState = require('../../../lib/iceberg/meta/init_state')

describe('iceberg:meta:init_state', () => {
  it('sets initial remainingAmount', () => {
    const state = initState({
      amount: 42
    })

    assert.strictEqual(state.remainingAmount, 42)
  })

  it('saves args on state', () => {
    const args = { amount: 42, otherArg: 100 }
    const state = initState(args)
    assert.deepStrictEqual(state.args, args)
  })
})
