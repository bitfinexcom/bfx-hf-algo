/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isEmpty = require('lodash/isEmpty')
const _isObject = require('lodash/isObject')
const _isFunction = require('lodash/isObject')
const { Order } = require('bfx-api-node-models')
const genHelpers = require('../../../lib/host/gen_helpers')
const AsyncEventEmitter = require('../../../lib/async_event_emitter')
const { EventEmitter } = require('events')
const sinon = require('sinon')
const { assert: assertFn } = sinon

const manager = new EventEmitter()
const H = (args = {}, adapter = {}) => {
  const state = {
    ev: new AsyncEventEmitter(),
    id: 1,
    gid: 42,
    ...args
  }
  return genHelpers(state, { m: manager, ...adapter })
}

describe('genHelpers', () => {
  afterEach(() => {
    manager.removeAllListeners()
  })

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
      'emit',
      'notifyUI',
      'cancelOrder',
      'submitOrder',
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

  describe('cancelOrder', () => {
    it('calls through to adapter', () => {
      const o = new Order({ symbol: 'tBTCUSD', price: 42, amount: 9000 })
      const ev = new AsyncEventEmitter()
      const state = { id: 1, gid: 42, ev, connection: 'conn' }
      let adapterFuncCalled = false

      const h = H(state, {
        cancelOrder: async (c, order) => {
          adapterFuncCalled = true

          assert.strictEqual(c, 'conn', 'connection not passed to adapter')
          assert.strictEqual(order.symbol, 'tBTCUSD', 'order not passed through to adapter')
          assert.strictEqual(order.price, 42, 'order not passed through to adapter')
          assert.strictEqual(order.amount, 9000, 'order not passed through to adapter')
        }
      })

      h.cancelOrder(state, o)
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

      const h = H(state, {
        cancelOrder: async () => {}
      })
      const patchedState = await h.cancelOrder(state, o)

      assert.ok(_isObject(patchedState), 'patched state not an object')
      assert.ok(_isEmpty(patchedState.orders), 'patched state still has order which was cancelled in active orders set')
      assert.ok(_isObject(patchedState.cancelledOrders), 'patched state does not have cancelled order map')
      assert.strictEqual(patchedState.cancelledOrders[o.cid], o, 'order not marked cancelled in patched state')
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

  describe('subscribeDataChannels', () => {
    const adapter = { subscribe: sinon.stub() }
    let h

    beforeEach(() => {
      h = H({}, adapter)
    })

    it('subscribes to channels and wait for response', async () => {
      const channel = 'book'
      const payload = {
        symbol: 'LEO'
      }
      const state = {
        connection: 'connection',
        channels: [
          {
            channel,
            filter: payload
          }
        ]
      }
      const promise = h.subscribeDataChannels(state)
      await manager.emit('ws2:event:subscribed', {
        channel,
        ...payload
      })

      await promise
      assertFn.calledWithExactly(adapter.subscribe, state.connection, channel, payload)
    })

    it('fire and forget', async () => {
      const channel = 'book'
      const payload = {
        symbol: 'LEO'
      }
      const state = {
        connection: 'connection',
        channels: [
          {
            channel,
            filter: payload
          }
        ]
      }
      await h.subscribeDataChannels(state, { fireAndForget: true })
      assertFn.calledWithExactly(adapter.subscribe, state.connection, channel, payload)
    })

    it('subscribes with max wait time', async () => {
      const channel = 'book'
      const payload = {
        symbol: 'LEO'
      }
      const state = {
        connection: 'connection',
        channels: [
          {
            channel,
            filter: payload
          }
        ]
      }

      try {
        await h.subscribeDataChannels(state, { timeout: 10 })
        assert.fail()
      } catch (e) {
        assert.strictEqual(e.message, 'Subscription to channel \'book\' timed out')
      }

      assertFn.calledWithExactly(adapter.subscribe, state.connection, channel, payload)
    })
  })

  describe('close', () => {
    const adapter = { subscribe: sinon.stub() }
    let h

    beforeEach(() => {
      h = H({}, adapter)
    })

    it('should clear pending responses and its timeouts if any', async () => {
      const channel = 'book'
      const payload = {
        symbol: 'LEO'
      }
      const state = {
        connection: 'connection',
        channels: [
          {
            channel,
            filter: payload
          }
        ]
      }

      const promise = h.subscribeDataChannels(state, { timeout: 1000 })
      assert(manager.listenerCount('ws2:event:subscribed') > 0)
      h.close()

      await promise
      assertFn.calledWithExactly(adapter.subscribe, state.connection, channel, payload)
      assert(manager.listenerCount('ws2:event:subscribed') === 0)
    })
  })
})
