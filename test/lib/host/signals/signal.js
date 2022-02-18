/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
'use strict'

const { expect } = require('chai')

const Signal = require('../../../../lib/host/signals/signal')

describe('Signal', () => {
  const id = 10
  const name = 'name'
  const parent = { id: 1 }

  it('construct', () => {
    const signal = new Signal({ id, name, parent })
    expect(signal.id).to.eq(id)
    expect(signal.name).to.eq(name)
    expect(signal.meta).to.eql({})
    expect(signal.parent).to.eq(parent)
    expect(signal.started_at).to.be.a('number')
  })

  it('end', () => {
    const signal = new Signal({ id, name, parent })
    expect(signal.ended_at).to.be.undefined
    signal.end()
    expect(signal.ended_at).to.be.a('number')
  })
})
