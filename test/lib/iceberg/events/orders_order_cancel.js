/* eslint-env mocha */
'use strict'

const { stub, assert } = require('sinon')
const onOrderCancel = require('../../../../lib/iceberg/events/orders_order_cancel')
const { expect } = require('chai')
const { OrderCancelledSignal } = require('bfx-hf-signals/lib/types')

describe('iceberg:events:orders_order_cancel', () => {
  const tracer = {
    collect: stub()
  }
  const h = {
    emit: stub(),
    debug: stub(),
    tracer
  }
  const instance = { h }
  const order = { id: 1, cid: 2, gid: 3 }

  it('submits all known orders for cancellation & stops operation', async () => {
    const fakeSignal = { id: 10 }
    tracer.collect.returns(fakeSignal)

    await onOrderCancel(instance, order)

    const [signal] = tracer.collect.firstCall.args
    expect(signal).to.be.instanceOf(OrderCancelledSignal)
    expect(signal.meta).to.eql({ order: { ...order } })
    assert.calledWithExactly(h.emit, 'exec:stop', null, { origin: fakeSignal })
  })
})
