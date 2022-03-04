/* eslint-env mocha */
'use strict'

const { expect } = require('chai')
const { assert, createSandbox } = require('sinon')
const onOrderFill = require('../../../../lib/iceberg/events/orders_order_fill')
const { OrderFilledSignal, CancelAllSignal } = require('bfx-hf-signals/lib/types')

describe('iceberg:events:orders_order_fill', () => {
  const sandbox = createSandbox()

  afterEach(() => {
    sandbox.reset()
  })

  const order = {
    id: 87,
    cid: 4934,
    gid: 123,
    getLastFillAmount: sandbox.stub(),
    resetFilledAmount: sandbox.stub()
  }
  const state = {
    args: { amount: 100 },
    orders: {},
    gid: 123,
    remainingAmount: 80
  }
  const tracer = {
    collect: sandbox.stub()
  }
  const h = {
    tracer,
    emit: sandbox.stub(),
    updateState: sandbox.stub(),
    debug: sandbox.stub(),
    debouncedSubmitOrders: sandbox.stub()
  }
  const instance = { state, h }

  it('', async () => {
    const fillSignal = { id: 1, meta: {} }
    tracer.collect.onCall(0).returns(fillSignal)

    const lastFillAmount = 50
    const remainingAmount = state.remainingAmount - lastFillAmount
    order.getLastFillAmount.returns(lastFillAmount)

    await onOrderFill(instance, order)

    const [[orderFilledSignal], [cancelAllSignal]] = tracer.collect.args
    expect(orderFilledSignal).to.be.instanceOf(OrderFilledSignal)
    expect(orderFilledSignal.meta).to.eql({ order: { gid: 123, id: 87, cid: 4934 } })
    expect(cancelAllSignal).to.be.instanceOf(CancelAllSignal)
    expect(cancelAllSignal.parent).to.eq(fillSignal)

    assert.calledOnce(h.emit)
    assert.calledWithExactly(h.emit, 'exec:order:cancel:all', state.gid, state.orders)
    assert.calledWithExactly(order.getLastFillAmount)
    assert.calledWithExactly(order.resetFilledAmount)
    assert.calledWithExactly(h.updateState, instance, { remainingAmount })
    assert.calledWithExactly(h.debouncedSubmitOrders, fillSignal)

    expect(fillSignal.meta.fillAmount).to.eq(lastFillAmount)
    expect(fillSignal.meta.remainingAmount).to.eq(remainingAmount)
  })

  it('', async () => {
    const fillSignal = { id: 1, meta: {} }
    tracer.collect.onCall(0).returns(fillSignal)

    const lastFillAmount = 80
    const remainingAmount = state.remainingAmount - lastFillAmount
    order.getLastFillAmount.returns(lastFillAmount)

    await onOrderFill(instance, order)

    const [[orderFilledSignal], [cancelAllSignal]] = tracer.collect.args
    expect(orderFilledSignal).to.be.instanceOf(OrderFilledSignal)
    expect(orderFilledSignal.meta).to.eql({ order: { gid: 123, id: 87, cid: 4934 } })
    expect(cancelAllSignal).to.be.instanceOf(CancelAllSignal)
    expect(cancelAllSignal.parent).to.eq(fillSignal)
    assert.calledWithExactly(h.emit, 'exec:order:cancel:all', state.gid, state.orders)
    assert.calledWithExactly(order.getLastFillAmount)
    assert.calledWithExactly(order.resetFilledAmount)
    assert.calledWithExactly(h.updateState, instance, { remainingAmount })
    assert.notCalled(h.debouncedSubmitOrders)
    assert.calledWithExactly(h.emit, 'exec:stop', null, { origin: fillSignal })

    expect(fillSignal.meta.fillAmount).to.eq(lastFillAmount)
    expect(fillSignal.meta.remainingAmount).to.eq(remainingAmount)
  })
})
