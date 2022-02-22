/* eslint-env mocha */
'use strict'

const { stub, assert } = require('sinon')
const { expect } = require('chai')
const { StartSignal } = require('bfx-hf-signals/lib/types')

const onLifeStart = require('../../../../lib/iceberg/events/life_start')

describe('iceberg:events:life_start', () => {
  const emitSelf = stub()
  const collect = stub()

  const tracer = { collect }
  const h = { emitSelf, tracer }
  const instance = { h }

  it('submits orders on startup', async () => {
    const fakeSignal = {}
    collect.returns(fakeSignal)

    await onLifeStart(instance)

    assert.calledOnce(collect)
    const [signal] = collect.firstCall.args
    expect(signal).to.be.instanceOf(StartSignal)
    expect(signal.meta).to.eql({ args: {} })
    assert.calledWithExactly(emitSelf, 'submit_orders', fakeSignal)
  })
})
