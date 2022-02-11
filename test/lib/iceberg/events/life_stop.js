/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
'use strict'

const { expect } = require('chai')
const { stub, assert } = require('sinon')
const onLifeStop = require('../../../../lib/iceberg/events/life_stop')

describe('iceberg:events:life_stop', () => {
  const state = {
    orders: {},
    gid: 123,
    timeout: setTimeout(() => {}, 10000)
  }
  const tracer = {
    createSignal: stub()
  }
  const h = {
    tracer,
    debouncedSubmitOrders: {
      cancel: stub()
    },
    emit: stub(),
    debug: stub(),
    updateState: stub()
  }
  const instance = { state, h }
  const opts = { origin: { id: 1 } }

  it('cancels all orders when iceberg algo stopped', async () => {
    const fakeSignal = { id: 2 }
    tracer.createSignal.onCall(0).returns(fakeSignal)

    await onLifeStop(instance, opts)

    assert.calledWithExactly(h.debouncedSubmitOrders.cancel)
    expect(state.timeout._destroyed).to.be.true
    assert.calledWithExactly(h.updateState, instance, { timeout: null })
    assert.calledWithExactly(tracer.createSignal, 'stop', opts.origin)
    assert.calledWithExactly(tracer.createSignal, 'cancel_all', fakeSignal)
    assert.calledWithExactly(h.emit, 'exec:order:cancel:all', state.gid, state.orders)
  })
})
