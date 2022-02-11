/* eslint-env mocha */
'use strict'

const { stub, assert } = require('sinon')

const onLifeStart = require('../../../../lib/iceberg/events/life_start')

describe('iceberg:events:life_start', () => {
  const emitSelf = stub()
  const createSignal = stub()

  const tracer = { createSignal }
  const h = { emitSelf, tracer }
  const instance = { h }

  it('submits orders on startup', async () => {
    const fakeSignal = {}
    createSignal.returns(fakeSignal)

    await onLifeStart(instance)

    assert.calledWithExactly(createSignal, 'start')
    assert.calledWithExactly(emitSelf, 'submit_orders', fakeSignal)
  })
})
