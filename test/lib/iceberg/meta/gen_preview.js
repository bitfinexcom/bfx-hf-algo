/* eslint-env mocha */
'use strict'

const assert = require('assert')
const genPreview = require('../../../../lib/iceberg/meta/gen_preview')

const getState = (argOverrides = {}) => {
  return {
    amount: 42,
    sliceAmount: 10,
    symbol: 'tBTCUSD',
    price: 50000,
    orderType: 'LIMIT',
    ...argOverrides
  }
}

describe('iceberg:meta:init_state', () => {
  it('generates the sliced order a/c to given input', () => {
    const o = genPreview(getState())
    const [slicedOrder] = o

    assert.deepStrictEqual(o.length, 1, 'no order created')
    assert.deepStrictEqual(slicedOrder.amount, 10, 'invalid sliced amount')
    assert.deepStrictEqual(slicedOrder.symbol, 'tBTCUSD', 'invalid order symbol')
    assert.deepStrictEqual(slicedOrder.price, 50000, 'invalid order price')
  })

  it('generates the correct sliced order for float amounts', () => {
    const o = genPreview(getState({
      excessAsHidden: true,
      amount: 0.3,
      sliceAmount: 0.1
    }))
    const [excessOrder, slicedOrder] = o

    assert.deepStrictEqual(excessOrder.amount, 0.2, 'invalid excess sliced amount')
    assert.deepStrictEqual(slicedOrder.amount, 0.1, 'invalid sliced amount')
  })

  it('generates an extra hidden order for excess amount', () => {
    const o = genPreview(getState({ excessAsHidden: true }))
    const [excessOrder] = o

    assert.deepStrictEqual(o.length, 2, 'did not create an order for excess amount')
    assert.ok(excessOrder.hidden, 'did not create a hidden order for excess amount')
    assert.deepStrictEqual(excessOrder.amount, 32, 'invalid excess amount')
  })
})
