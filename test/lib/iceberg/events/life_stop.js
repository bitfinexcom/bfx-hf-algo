/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
'use strict'

const { expect } = require('chai')
const { stub, assert } = require('sinon')
const onLifeStop = require('../../../../lib/iceberg/events/life_stop')
const { StopSignal, CancelAllSignal } = require('bfx-hf-signals/lib/types')

describe('iceberg:events:life_stop', () => {
  const state = {
    orders: {},
    gid: 123,
    timeout: setTimeout(() => {}, 10000)
  }
  const tracer = {
    collect: stub()
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
    tracer.collect.onCall(0).returns(fakeSignal)

    await onLifeStop(instance, opts)

    assert.calledWithExactly(h.debouncedSubmitOrders.cancel)
    expect(state.timeout._destroyed).to.be.true
    assert.calledWithExactly(h.updateState, instance, { timeout: null })
    const [[stopSignal], [cancelAllSignal]] = tracer.collect.args
    expect(stopSignal).to.be.instanceOf(StopSignal)
    expect(stopSignal.parent).to.eq(opts.origin)
    expect(cancelAllSignal).to.be.instanceOf(CancelAllSignal)
    expect(cancelAllSignal.parent).to.eq(fakeSignal)
    assert.calledWithExactly(h.emit, 'exec:order:cancel:all', state.gid, state.orders)
  })
})
