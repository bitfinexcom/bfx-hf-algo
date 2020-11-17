/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isEmpty = require('lodash/isEmpty')
const _isObject = require('lodash/isObject')
const _isFunction = require('lodash/isObject')
const { Order } = require('bfx-api-node-models')
const genHelpers = require('../../../lib/host/gen_helpers')
const AsyncEventEmitter = require('../../../lib/async_event_emitter')

const H = (args = {}, adapter = null) => (
  genHelpers({
    ev: new AsyncEventEmitter(),
    id: 1,
    gid: 42,
    ...args
  }, adapter)
)

describe('genHelpers', () => {
  /**
   * These tests enforce the helper API; it is used by all AOs and serves as
   * the core of bfx-hf-algo alongside the AO Host (which processes all events)
   *
   * Methods here are also relied upon by the exchange adapters
   * (and vice-versa.) Seen throughout AO logic as the 'h' object.
   *
   * If something changes here, there better be a good reason for it.
   */
  it('provides a standard API', () => {
    const h = H()
    const API = [
      'debug', // untested, logging func, TODO: refactor import so it can be mocked
      'emitSelf',
      'emitSelfAsync',
      'emit',
      'emitAsync',
      'notifyUI',
      'cancelOrderWithDelay',
      'cancelAllOrdersWithDelay',
      'submitOrderWithDelay',
      'declareEvent',
      'declareChannel',
      'updateState'
    ]

    assert.ok(_isObject(h), 'helpers not an object')

    API.forEach(methodName => {
      assert.ok(_isFunction(h[methodName]), `no ${methodName} helper`)
    })
  })

  describe('emitSelf', () => {
    it('emits the event on the self scope using the helper state', async () => {
      const ev = new AsyncEventEmitter()
      const h = H({ ev })
      let eventSeen = false

      ev.once('self:test', (...args) => {
        assert.deepStrictEqual(args, [1, 2, 3], 'emitter did not pass args through')
        eventSeen = true
      })

      await h.emitSelf('test', 1, 2, 3)

      assert.ok(eventSeen, 'did not emit test event')
    })
  })

  describe('emitSelfAsync', () => {
    it('emits on the self scope after a timeout using the helper state', (done) => {
      const ev = new AsyncEventEmitter()
      const h = H({ ev })

      ev.once('self:test', (...args) => {
        assert.deepStrictEqual(args, [1, 2, 3], 'emitter did not pass args through')
        done()
      })

      h.emitSelfAsync('test', 1, 2, 3)
    })
  })

  describe('emit', () => {
    it('emits immediately', async () => {
      const ev = new AsyncEventEmitter()
      const h = H({ ev })
      let eventSeen = false

      ev.once('test', (...args) => {
        assert.deepStrictEqual(args, [1, 2, 3], 'emitter did not pass args through')
        eventSeen = true
      })

      await h.emit('test', 1, 2, 3)
      assert.ok(eventSeen, 'event should have fired')
    })
  })

  describe('emitAsync', () => {
    it('emits on the self scope after a timeout using the helper state', (done) => {
      const ev = new AsyncEventEmitter()
      const h = H({ ev })

      ev.once('test', (...args) => {
        assert.deepStrictEqual(args, [1, 2, 3], 'emitter did not pass args through')
        done()
      })

      h.emitAsync('test', 1, 2, 3)
    })
  })

  describe('notifyUI', () => {
    it('emits a notify event with the helper gid', async () => {
      const ev = new AsyncEventEmitter()
      const h = H({ ev })
      let notifySeen = false

      ev.once('notify', (gid, level, message) => {
        assert.strictEqual(gid, 42, 'helper did not pass gid through')
        assert.strictEqual(level, 'info', 'helper did not pass notification level through')
        assert.strictEqual(message, 'testing all the time', 'helper did not pass notification text through')
        notifySeen = true
      })

      await h.notifyUI('info', 'testing all the time')
      assert.ok(notifySeen, 'notify was not emitted')
    })
  })

  describe('cancelOrderWithDelay', () => {
    it('calls through to adapter', () => {
      const o = new Order({ symbol: 'tBTCUSD', price: 42, amount: 9000 })
      const ev = new AsyncEventEmitter()
      const state = { id: 1, gid: 42, ev, connection: 'conn' }
      let adapterFuncCalled = false

      const h = H(state, {
        cancelOrderWithDelay: (c, delay, order) => {
          adapterFuncCalled = true

          assert.strictEqual(c, 'conn', 'connection not passed to adapter')
          assert.strictEqual(delay, 100, 'delay not passed through to adapter')
          assert.strictEqual(order.symbol, 'tBTCUSD', 'order not passed through to adapter')
          assert.strictEqual(order.price, 42, 'order not passed through to adapter')
          assert.strictEqual(order.amount, 9000, 'order not passed through to adapter')
        }
      })

      h.cancelOrderWithDelay(state, 100, o)
      assert.ok(adapterFuncCalled, 'adapter func not called')
    })

    it('immediately patches order set', async () => {
      const o = new Order({ cid: '10', symbol: 'tBTCUSD', price: 42, amount: 9000 })
      const ev = new AsyncEventEmitter()
      const state = {
        id: 1,
        gid: 42,
        ev,
        connection: 'conn',
        orders: { [o.cid]: o },
        cancelledOrders: {}
      }

      const h = H(state, { cancelOrderWithDelay: () => {} })
      const patchedState = await h.cancelOrderWithDelay(state, 100, o)

      assert.ok(_isObject(patchedState), 'patched state not an object')
      assert.ok(_isEmpty(patchedState.orders), 'patched state still has order which was cancelled in active orders set')
      assert.ok(_isObject(patchedState.cancelledOrders), 'patched state does not have cancelled order map')
      assert.strictEqual(patchedState.cancelledOrders[o.cid], o, 'order not marked cancelled in patched state')
    })
  })

  describe('cancelAllOrdersWithDelay', () => {
    it('calls through to adapter with each order individually from state', async () => {
      const oA = new Order({ cid: '10' })
      const oB = new Order({ cid: '20' })
      const ev = new AsyncEventEmitter()
      const state = {
        id: 1,
        gid: 42,
        ev,
        connection: 'conn',
        orders: { [oA.cid]: oA, [oB.cid]: oB },
        cancelledOrders: {}
      }

      let oACancelled = false
      let oBCancelled = false

      const h = H(state, {
        cancelOrderWithDelay: async (conn, delay, o) => {
          assert.strictEqual(conn, 'conn')
          assert.strictEqual(delay, 100)

          if (o === '10') oACancelled = true
          if (o === '20') oBCancelled = true
        }
      })

      await h.cancelAllOrdersWithDelay(state, 100)

      assert.ok(oACancelled, 'order A not cancelled')
      assert.ok(oBCancelled, 'order B not cancelled')
    })

    it('immediately patches order set', async () => {
      const oA = new Order({ cid: '10' })
      const oB = new Order({ cid: '20' })
      const ev = new AsyncEventEmitter()
      const state = {
        id: 1,
        gid: 42,
        ev,
        connection: 'conn',
        orders: { [oA.cid]: oA, [oB.cid]: oB },
        cancelledOrders: {}
      }

      const h = H(state, { cancelOrderWithDelay: async (conn, delay, o) => {} })
      const patchedState = await h.cancelAllOrdersWithDelay(state, 100)

      assert.ok(_isObject(patchedState), 'patched state not an object')
      assert.ok(_isEmpty(patchedState.orders), 'patched state still has order which was cancelled in active orders set')
      assert.ok(_isObject(patchedState.cancelledOrders), 'patched state does not have cancelled order map')
      assert.strictEqual(patchedState.cancelledOrders[oA.cid], oA, 'order A not marked cancelled in patched state')
      assert.strictEqual(patchedState.cancelledOrders[oB.cid], oB, 'order B not marked cancelled in patched state')
    })
  })

  describe('declareEvent', () => {
    it('binds the host\'s onAOSelfEvent listener to the event name on the helper ev', (done) => {
      const host = { onAOSelfEvent: () => {} }
      const ev = {
        on: (eventName, handler) => {
          assert.strictEqual(eventName, 'test')
          assert.ok(/onAOSelfEvent/.test(handler.name), 'did not bind AO host\'s listener')
          done()
        }
      }

      const state = { ev }
      const h = H(state)
      h.declareEvent({ state }, host, 'test', 'some-path-not-tested')
    })
  })

  describe('declareChannel', () => {
    it('emits the channel:asslgin event with the helper group ID', (done) => {
      const ev = new AsyncEventEmitter()

      ev.once('channel:assign', (gid, channel, filter) => {
        assert.strictEqual(gid, '42')
        assert.strictEqual(channel, 'some-channel')
        assert.strictEqual(filter, 'some-filter')
        done()
      })

      const state = { ev, gid: '42' }
      const h = H(state)
      h.declareChannel({ h, state }, {}, 'some-channel', 'some-filter')
    })
  })

  describe('updateState', () => {
    it('emits the state:update event with the helper group ID', (done) => {
      const ev = new AsyncEventEmitter()

      ev.once('state:update', (gid, update) => {
        assert.strictEqual(gid, '42')
        assert.strictEqual(update, 'some-update')
        done()
      })

      const state = { ev, gid: '42' }
      const h = H(state)
      h.updateState({ h, state }, 'some-update')
    })
  })
})
