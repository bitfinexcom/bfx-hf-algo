/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFinite = require('lodash/isFinite')
const generateOrders = require('experimental/iceberg/util/generate_orders')
const { Config } = require('bfx-api-node-core')
const { DUST } = Config

const args = {
  orderType: 'LIMIT',
  symbol: 'tBTCUSD',
  amount: 1,
  sliceAmount: 0.1,
  excessAsHidden: false,
  price: 1000
}

describe('iceberg:util:generate_orders', () => {
  it('generates valid slice order', () => {
    const orders = generateOrders({ remainingAmount: args.amount, args })
    const [ slice ] = orders

    assert.equal(orders.length, 1)
    assert.equal(slice.symbol, args.symbol)
    assert.equal(slice.price, args.price)
    assert.equal(slice.type, args.orderType)
    assert(_isFinite(Number(slice.cid)))
    assert.equal(slice.amount, args.sliceAmount)
  })

  it('caps slice order at remainingAmount if less than slice', () => {
    const orders = generateOrders({ remainingAmount: 0.05, args })
    const [ slice ] = orders
    assert.equal(slice.amount, 0.05)
  })

  it('generates hidden order if excess flag is enabled', () => {
    const orders = generateOrders({
      remainingAmount: args.amount,
      args: {
        ...args,
        excessAsHidden: true
      }
    })

    const [, hidden] = orders
    assert.equal(orders.length, 2)
    assert.equal(hidden.symbol, args.symbol)
    assert.equal(hidden.price, args.price)
    assert.equal(hidden.type, args.orderType)
    assert(_isFinite(Number(hidden.cid)))
    assert.equal(hidden.amount, 0.9)
  })

  it('caps excess order at remaining amount after slice', () => {
    const orders = generateOrders({
      remainingAmount: 0.15,
      args: {
        ...args,
        excessAsHidden: true
      }
    })

    const [, hidden] = orders
    assert((hidden.amount - 0.05) < DUST)
  })

  it('generates no hidden order if amount after slice is less than dust', () => {
    const orders = generateOrders({
      remainingAmount: 0.10000001,
      args: {
        ...args,
        excessAsHidden: true
      }
    })

    assert.equal(orders.length, 1)
  })

  it('generates no orders if remaining amount is less than dust', () => {
    const orders = generateOrders({
      remainingAmount: 0.00000001,
      args
    })

    assert.equal(orders.length, 0)
  })
})
