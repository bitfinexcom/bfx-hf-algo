/* eslint-env mocha */
'use strict'

const assert = require('assert')
const generateOrder = require('../../../../lib/twap/util/generate_order')
const { nBN } = require('@bitfinex/lib-js-util-math')

const orders = {
  1: {
    amount: 1.00001
  },
  2: {
    amount: 0.98
  },
  3: {
    amount: 1.02
  },
  4: {
    amount: 1.01567
  }
}

const getState = ({ argOverrides = {}, overrides = {} }) => ({
  remainingAmount: 10,
  args: {
    sliceAmount: 1,
    amount: 10,
    orderType: 'LIMIT',
    symbol: 'tLEOUSD',
    lev: 3.3,
    _futures: true,
    _margin: false,
    ...argOverrides
  },
  ...overrides
})

describe('twap:util:generate_order', () => {
  it('generates an order for the slice amount if at least that much is left', () => {
    const o = generateOrder(getState({}), 42)
    assert.strictEqual(o.amount, 1)
  })

  it('generates an order for the correct remaining amount if it is less than a slice', () => {
    const o = generateOrder(getState({ overrides: { remainingAmount: 0.5 } }), 42)
    assert.strictEqual(o.amount, 0.5)
  })

  it('sets the _HF flag', () => {
    const o = generateOrder(getState({ argOverrides: { meta: { _HF: 1 } } }), 42)
    assert.strictEqual(o.meta._HF, 1)
  })

  describe('check order amount within distortion range', () => {
    it('distorts the amount to the given distortion range', () => {
      const amountDistortion = 0.2
      const maxDistortedAmount = 1.2
      const minDistortedAmount = 0.8
      const state = getState({
        argOverrides: { amountDistortion },
        overrides: { minDistortedAmount, maxDistortedAmount }
      })
      const o = generateOrder(state, 42)
      const amountInDistortedRange = o.amount <= maxDistortedAmount && o.amount >= minDistortedAmount
      assert.strictEqual(amountInDistortedRange, true)
    })

    it('distorts the amount within the range of minimum allowed size and max distorted size', () => {
      const amountDistortion = 0.4
      const pairConfig = { minSize: 1, maxSize: 100 }
      const minDistortedAmount = 1
      const maxDistortedAmount = 1.4
      const state = getState({
        argOverrides: { amountDistortion },
        overrides: { pairConfig, minDistortedAmount, maxDistortedAmount }
      })
      const o = generateOrder(state, 42)
      const amountInDistortedRange = o.amount <= maxDistortedAmount && o.amount >= minDistortedAmount
      assert.strictEqual(amountInDistortedRange, true)
    })

    it('distorts the amount within the range of minimum distorted size and max allowed size', () => {
      const amountDistortion = 0.4
      const pairConfig = { minSize: 1, maxSize: 100 }
      const maxDistortedAmount = 100
      const minDistortedAmount = 0.6
      const state = getState({
        argOverrides: { amountDistortion, sliceAmount: 100, amount: 1000 },
        overrides: { pairConfig, remainingAmount: 1000, minDistortedAmount, maxDistortedAmount }
      })
      const o = generateOrder(state, 42)
      const amountInDistortedRange = o.amount <= maxDistortedAmount && o.amount >= minDistortedAmount
      assert.strictEqual(amountInDistortedRange, true)
    })
  })

  it('doesn\'t overuse the total amount while generating order', () => {
    const amount = 5
    const openAmount = Object.values(orders).reduce((acc, current) => {
      return acc + current.amount
    }, 0)
    const remainingAmount = nBN(amount).minus(openAmount).toNumber()
    const amountDistortion = 0.02
    const state = getState({
      overrides: { orders, amount, remainingAmount, minDistortedAmount: 0.98, maxDistortedAmount: 1.02 },
      argOverrides: { amountDistortion }
    })
    const o = generateOrder(state, 42)
    assert.strictEqual(amount >= nBN(openAmount).plus(o.amount).toNumber(), true)
  })
})
