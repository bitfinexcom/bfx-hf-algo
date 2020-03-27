/* eslint-env mocha */
'use strict'

const assert = require('assert')
const generateOrder = require('../../../../lib/twap/util/generate_order')

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
    const o = generateOrder(getState({}), 42)
    assert.strictEqual(o.meta._HF, 1)
  })
})
