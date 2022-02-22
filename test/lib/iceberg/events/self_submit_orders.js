/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
'use strict'

const { Order } = require('bfx-api-node-models')
const { assert, stub } = require('sinon')
const { expect } = require('chai')
const onSubmitOrders = require('../../../../lib/iceberg/events/self_submit_orders')

describe('iceberg:events:self_submit_orders', () => {
  const args = {
    excessAsHidden: false,
    sliceAmount: 0.1,
    amount: 1,
    price: 1000,
    orderType: 'EXCHANGE MARKET',
    symbol: 'tBTCUSD'
  }
  const state = {
    gid: 41,
    remainingAmount: 0.05,
    args
  }
  const tracer = { collect: stub() }
  const h = { emit: stub(), tracer }
  const instance = { state, h }

  it('submits generated orders', async () => {
    await onSubmitOrders(instance, null)

    assert.calledOnce(h.emit)
    const [eventName, gid, orders] = h.emit.firstCall.args
    expect(eventName).to.eq('exec:order:submit:all')
    expect(gid).to.eq(state.gid)
    expect(orders).to.have.length(1)

    const [order] = orders
    expect(order).to.be.instanceOf(Order)
    expect(order.symbol).to.be.eq(args.symbol)
    expect(order.price).to.be.eq(args.price)
    expect(order.cid).to.be.a('number')
    expect(order.type).to.be.eq(args.orderType)
    expect(order.amount).to.be.eq(0.05)
    expect(order.meta).to.be.undefined

    assert.calledOnce(tracer.collect)
    const [signal] = tracer.collect.firstCall.args
    expect(signal.name).to.eq('order')
    expect(signal.parent).to.be.null
    expect(signal.meta.symbol).to.be.eq(args.symbol)
    expect(signal.meta.price).to.be.eq(args.price)
    expect(signal.meta.cid).to.be.a('number')
    expect(signal.meta.type).to.be.eq(args.orderType)
    expect(signal.meta.amount).to.be.eq(0.05)
    expect(signal.meta.meta).to.be.undefined
  })
})
