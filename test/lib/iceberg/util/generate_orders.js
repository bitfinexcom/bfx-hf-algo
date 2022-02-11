/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFinite = require('lodash/isFinite')
const generateOrders = require('../../../../lib/iceberg/util/generate_orders')
const { Config } = require('bfx-api-node-core')
const { DUST } = Config
const { stub } = require('sinon')

describe('iceberg:util:generate_orders', () => {
  const tracer = {
    createSignal: stub()
  }
  const h = { tracer }
  const args = {
    orderType: 'LIMIT',
    symbol: 'tBTCUSD',
    amount: 1,
    sliceAmount: 0.1,
    excessAsHidden: false,
    price: 1000
  }

  it('generates valid slice order', () => {
    const state = { remainingAmount: args.amount, args }
    const instance = { state, h }
    const orders = generateOrders(instance)
    const [slice] = orders

    assert.strictEqual(orders.length, 1)
    assert.strictEqual(slice.symbol, args.symbol)
    assert.strictEqual(slice.price, args.price)
    assert.strictEqual(slice.type, args.orderType)
    assert(_isFinite(Number(slice.cid)))
    assert.strictEqual(slice.amount, args.sliceAmount)
  })

  it('generates valid slice order, floats', () => {
    const order = {
      orderType: 'LIMIT',
      symbol: 'tBTCUSD',
      amount: 0.3,
      sliceAmount: 0.1,
      excessAsHidden: true,
      price: 1000
    }

    const state = { remainingAmount: 0.3, args: order }
    const instance = { state, h }
    const orders = generateOrders(instance)
    const [hidden] = orders

    assert.strictEqual(hidden.amount, 0.2, 'not -0.19999999999999998')
  })

  it('caps slice order at remainingAmount if less than slice', () => {
    const state = { remainingAmount: 0.05, args }
    const instance = { state, h }
    const orders = generateOrders(instance)
    const [slice] = orders
    assert.strictEqual(slice.amount, 0.05)
  })

  it('generates hidden order if excess flag is enabled', () => {
    const state = {
      remainingAmount: args.amount,
      args: {
        ...args,
        excessAsHidden: true
      }
    }
    const instance = { state, h }
    const orders = generateOrders(instance)

    const [hidden] = orders
    assert.strictEqual(orders.length, 2)
    assert.strictEqual(hidden.symbol, args.symbol)
    assert.strictEqual(hidden.price, args.price)
    assert.strictEqual(hidden.type, args.orderType)
    assert(_isFinite(Number(hidden.cid)))
    assert.strictEqual(hidden.amount, 0.9)
  })

  it('caps excess order at remaining amount after slice', () => {
    const state = {
      remainingAmount: 0.15,
      args: {
        ...args,
        excessAsHidden: true
      }
    }
    const instance = { state, h }
    const orders = generateOrders(instance)

    const [hidden] = orders
    assert((hidden.amount - 0.05) < DUST)
  })

  it('generates no hidden order if amount after slice is less than dust', () => {
    const state = {
      remainingAmount: 0.10000001,
      args: {
        ...args,
        excessAsHidden: true
      }
    }
    const instance = { state, h }
    const orders = generateOrders(instance)

    assert.strictEqual(orders.length, 1)
  })

  it('generates no orders if remaining amount is less than dust', () => {
    const state = {
      remainingAmount: 0.00000001,
      args
    }
    const instance = { state, h }
    const orders = generateOrders(instance)

    assert.strictEqual(orders.length, 0)
  })
})
