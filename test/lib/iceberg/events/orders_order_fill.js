/* eslint-env mocha */
'use strict'

const { expect } = require('chai')
const { assert, createSandbox } = require('sinon')
const onOrderFill = require('../../../../lib/iceberg/events/orders_order_fill')

describe('iceberg:events:orders_order_fill', () => {
  const sandbox = createSandbox()

  afterEach(() => {
    sandbox.reset()
  })

  const order = {
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
    createSignal: sandbox.stub()
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
    tracer.createSignal.onCall(0).returns(fillSignal)

    const lastFillAmount = 50
    const remainingAmount = state.remainingAmount - lastFillAmount
    order.getLastFillAmount.returns(lastFillAmount)

    await onOrderFill(instance, order)

    assert.calledWithExactly(tracer.createSignal, 'order_filled')
    assert.calledWithExactly(tracer.createSignal, 'cancel_all', fillSignal)
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
    tracer.createSignal.onCall(0).returns(fillSignal)

    const lastFillAmount = 80
    const remainingAmount = state.remainingAmount - lastFillAmount
    order.getLastFillAmount.returns(lastFillAmount)

    await onOrderFill(instance, order)

    assert.calledWithExactly(tracer.createSignal, 'order_filled')
    assert.calledWithExactly(tracer.createSignal, 'cancel_all', fillSignal)
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
