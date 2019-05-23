/* eslint-env mocha */
'use strict'

const assert = require('assert')
const initState = require('twap/meta/init_state')

describe('twap:meta:init_state', () => {
  it('sets initial remainingAmount', () => {
    const state = initState({ amount: 42 })
    assert.strictEqual(state.remainingAmount, 42)
  })

  it('saves args on state', () => {
    const args = { amount: 42, otherArg: 100 }
    const state = initState(args)
    assert.deepStrictEqual(state.args, args)
  })

  it('seeds null interval', () => {
    const state = initState({ amount: 42 })
    assert.strictEqual(state.interval, null)
  })
})
