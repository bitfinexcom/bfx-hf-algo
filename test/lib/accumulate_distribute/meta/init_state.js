/* eslint-env mocha */
'use strict'

const sinon = require('sinon')
const assert = require('assert')
const orderAmounts = require('../../../../lib/accumulate_distribute/util/gen_order_amounts')
const initState = require('../../../../lib/accumulate_distribute/meta/init_state')

describe('accumulate_distribute:meta:init_state', () => {
  it('initializes order amounts', () => {
    const stubOrderAmountsGen = sinon.stub(orderAmounts, 'gen').returns([1, 2])
    const state = initState({ amount: 3 })

    assert.deepStrictEqual(state.orderAmounts, [1, 2])
    assert.deepStrictEqual(state.args, { amount: 3 })
    assert.strictEqual(state.remainingAmount, 3)

    stubOrderAmountsGen.restore()
  })

  it('initializes order amounts, floats', () => {
    const stubOrderAmountsGen = sinon.stub(orderAmounts, 'gen').returns([0.001, 0.002])
    const state = initState({ amount: 0.003 })

    assert.deepStrictEqual(state.orderAmounts, [0.001, 0.002])
    assert.deepStrictEqual(state.args, { amount: 0.003 })
    assert.strictEqual(state.remainingAmount, 0.003)

    stubOrderAmountsGen.restore()
  })

  it('throws an error if gen_order_amounts returns a greater total amount than requested by the user', () => {
    const stubOrderAmountsGen = sinon.stub(orderAmounts, 'gen').returns([1, 2, 1])

    assert.throws(() => {
      initState({ amount: 3 })
    })

    stubOrderAmountsGen.restore()
  })

  it('initializes timeline', () => {
    const stubOrderAmountsGen = sinon.stub(orderAmounts, 'gen').returns([1, 2])
    const state = initState({ amount: 3 })
    assert.strictEqual(state.currentOrder, 0)
    assert.strictEqual(state.ordersBehind, 0)
    stubOrderAmountsGen.restore()
  })
})
