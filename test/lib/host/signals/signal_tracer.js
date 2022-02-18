/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
'use strict'

const { expect } = require('chai')
const { stub, assert } = require('sinon')

const SignalTracer = require('../../../../lib/host/signals/signal_tracer')

describe('SignalTracer', () => {
  const isEnabled = true
  const storage = {
    isOpen: false,
    start: stub().resolves(),
    store: stub().resolves(),
    close: stub().resolves()
  }
  const tracer = new SignalTracer(isEnabled, storage)

  let parent, now
  const meta = { foo: 123 }

  before(() => {
    now = stub(Date, 'now').returns(0)
  })

  after(() => {
    now.restore()
  })

  it('create signal', () => {
    const signal = tracer.createSignal('parent', null, meta)

    expect(signal.id).to.eq(1)
    expect(tracer.signals).to.have.length(1)

    parent = signal
  })

  it('close', async () => {
    tracer.createSignal('child', parent)
    await tracer.close()

    expect(tracer.closed).to.be.true
    assert.calledTwice(storage.store)
    assert.calledWithExactly(storage.store, {
      id: 1,
      name: 'parent',
      parent: null,
      meta,
      started_at: 0
    })
    assert.calledWithExactly(storage.store, {
      id: 2,
      name: 'child',
      parent: 1,
      meta: {},
      started_at: 0
    })
    assert.calledWithExactly(storage.close)
  })

  describe('tracer is disabled', () => {
    const isEnabled = false
    const storage = undefined
    const tracer = new SignalTracer(isEnabled, storage)

    it('create signal', () => {
      const signal = tracer.createSignal('parent', null, meta)

      expect(signal.id).to.eq(1)
      expect(tracer.signals).to.have.length(0)
    })

    it('close', async () => {
      await tracer.close()
      expect(tracer.closed).to.be.true
    })
  })
})
