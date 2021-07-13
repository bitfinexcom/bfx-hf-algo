/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isString = require('lodash/isString')
const _isFinite = require('lodash/isFinite')
const _isArray = require('lodash/isArray')
const _isObject = require('lodash/isObject')
const _isEmpty = require('lodash/isEmpty')
const AsyncEventEmitter = require('../../../lib/async_event_emitter')
const initAOState = require('../../../lib/host/init_ao_state')

describe('host:init_ao_state', () => {
  it('proccesses & validates params', (done) => {
    initAOState({
      meta: {
        processParams: ({ test }) => ({ test: test.split('') }),
        validateParams: ({ test }) => {
          assert.deepStrictEqual(test, ['c', 'a', 't'])
          done()
        }
      }
    }, { test: 'cat' })
  })

  it('initialiazes state using the AO\'s init func', () => {
    const state = initAOState({
      meta: {
        initState: () => ({ test: 42 })
      }
    })

    assert.strictEqual(state.test, 42)
  })

  it('generates a valid group ID', () => {
    const { gid } = initAOState()
    assert.ok(_isString(gid))
  })

  it('defaults to active:false', () => {
    const { active } = initAOState()
    assert.ok(!active)
  })

  it('provides necessary default data', () => {
    const state = initAOState({ name: 'test', id: 'some-id' }, 42)

    assert.ok(_isArray(state.channels) && _isEmpty(state.channels))
    assert.ok(_isObject(state.orders) && _isEmpty(state.orders))
    assert.ok(_isObject(state.cancelledOrders) && _isEmpty(state.cancelledOrders))
    assert.ok(_isObject(state.allOrders) && _isEmpty(state.allOrders))
    assert.ok(state.ev instanceof AsyncEventEmitter)
    assert.ok(_isString(state.label) && !_isEmpty(state.name))
    assert.strictEqual(state.args, 42)
    assert.strictEqual(state.id, 'some-id')
  })
})
