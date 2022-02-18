/* eslint-env mocha */
'use strict'

const { stub, assert } = require('sinon')
const onOrderCancel = require('../../../../lib/iceberg/events/orders_order_cancel')

describe('iceberg:events:orders_order_cancel', () => {
  const tracer = {
    createSignal: stub()
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
    tracer.createSignal.returns(fakeSignal)

    await onOrderCancel(instance, order)

    assert.calledWithExactly(tracer.createSignal, 'order_cancelled', null, { order: { ...order } })
    assert.calledWithExactly(h.emit, 'exec:stop', null, { origin: fakeSignal })
  })
})
