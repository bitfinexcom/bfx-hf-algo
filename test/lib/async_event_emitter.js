/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Promise = require('bluebird')
const _isEmpty = require('lodash/isEmpty')
const AsyncEventEmitter = require('../../lib/async_event_emitter')

describe('AsyncEventEmitter', () => {
  describe('removeAllListeners', () => {
    it('removes listeners matching a regular expression', async () => {
      const e = new AsyncEventEmitter()

      e.on('test-a', async () => assert(false, 'should not have been called'))
      e.on('test-b', async () => assert(false, 'should not have been called'))

      e.removeAllListeners(/test/)

      await e.emit('test-a')
      await e.emit('test-b')
    })

    it('removes listeners not matching a regular expression', async () => {
      const e = new AsyncEventEmitter()
      let loneListenerCalled = false

      e.on('something', async () => assert(false, 'should not have been called'))
      e.on('else', async () => assert(false, 'should not have been called'))
      e.on('test', async () => { loneListenerCalled = true })

      e.removeAllListeners(/test/, true)

      await e.emit('something')
      await e.emit('else')
      await e.emit('test')

      assert(loneListenerCalled, 'listener not called')
    })

    it('removes listeners matching an event name', async () => {
      const e = new AsyncEventEmitter()

      e.on('test', async () => assert(false, 'should not have been called'))
      e.removeAllListeners('test')

      return e.emit('test')
    })

    it('removes all listeners if no filter is specified', async () => {
      const e = new AsyncEventEmitter()

      e.on('something', async () => assert(false, 'should not have been called'))
      e.on('else', async () => assert(false, 'should not have been called'))
      e.on('test', async () => assert(false, 'should not have been called'))

      e.removeAllListeners()
      await e.emit('something')
      await e.emit('else')

      return e.emit('test')
    })
  })

  describe('off', () => {
    it('removes a listener by callback if found', async () => {
      const e = new AsyncEventEmitter()
      const cb = async () => assert.ok(false, 'should not have been called')
      e.on('test', cb)
      e.off(cb)
      return e.emit('test')
    })
  })

  describe('once', () => {
    it('registers a listener that only fires once for the specified event', async () => {
      const e = new AsyncEventEmitter()
      let fired = false

      e.once('test', async () => {
        if (fired) {
          assert(false, 'should not have been called twice')
        } else {
          fired = true
        }
      })

      await e.emit('test')
      await e.emit('test')

      assert.ok(fired, 'listener not called')
    })
  })

  describe('on', () => {
    it('registers a persistent listener for an event', async () => {
      const e = new AsyncEventEmitter()
      let firedNTimes = 0

      e.on('test', async () => { firedNTimes++ })

      await e.emit('test')
      await e.emit('test')
      await e.emit('test')

      assert.strictEqual(firedNTimes, 3, 'listener not called 3 times')
    })
  })

  describe('emit', () => {
    it('emits an event to all matching listeners', async () => {
      const e = new AsyncEventEmitter()
      let fired = false

      e.on('test', async (...data) => {
        assert.deepStrictEqual(data, [1, 2, 3], 'listener did not receive correct data')
        fired = true
      })

      await e.emit('test', 1, 2, 3)
      assert.ok(fired, 'listener not called')
    })

    it('waits for all listeners to resolve before resolving', async () => {
      const e = new AsyncEventEmitter()

      e.on('test', async () => Promise.delay(10))
      e.on('test', async () => Promise.delay(20))
      e.on('test', async () => Promise.delay(30)) // run in parallel

      const now = Date.now()

      await e.emit('test')
      assert.ok(Date.now() - now >= 30, 'emitter did not wait for listeners to complete')
    })

    it('removes once listeners', async () => {
      const e = new AsyncEventEmitter()
      let fired = false

      e.once('test', async () => { fired = true })

      await e.emit('test')

      assert.ok(fired, 'listener not called')
      assert.ok(_isEmpty(e.listeners.test), 'once listener not removed after being called')
    })
  })

  describe('regex event handler matching', () => {
    it('calls event handlers if event name is matched by regexp', async () => {
      const e = new AsyncEventEmitter()
      let matchedCountA = 0
      let matchedCountB = 0

      e.on(/^test/, async () => { matchedCountA += 1 })
      e.on(/^another(.*)test$/, async () => { matchedCountB += 1 })

      await e.emit('test-a')
      await e.emit('test-b')
      await e.emit('another-abc-test')
      await e.emit('another42test')
      await e.emit('another?test')

      assert.strictEqual(matchedCountA, 2)
      assert.strictEqual(matchedCountB, 3)
    })
  })
})
