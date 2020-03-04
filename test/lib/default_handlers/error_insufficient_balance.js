/* eslint-env mocha */
'use strict'

const assert = require('assert')
const { Order, Notification } = require('bfx-api-node-models')
const errorInsufficientBalance = require('../../../lib/default_handlers/error_insufficient_balance')

describe('default error:insufficient-balance handler', () => {
  it('notifies the UI of the error', async () => {
    const o = new Order()
    const n = new Notification({ text: 'from bitfinex' })

    let notified = false

    await errorInsufficientBalance({
      state: { args: {} },
      h: {
        debug: () => {},
        emit: async () => {},
        notifyUI: async (type, text) => {
          assert.strictEqual(type, 'error', 'notification not an error')
          assert.strictEqual(text, 'from bitfinex', 'did not pass unaltered notification text')
          notified = true
        }
      }
    }, o, n)

    assert.ok(notified, 'did not notify')
  })

  it('emits the exec:stop event', async () => {
    const o = new Order()
    const n = new Notification({ text: 'from bitfinex' })

    let sawExecStop = false

    await errorInsufficientBalance({
      state: { args: {} },
      h: {
        debug: () => {},
        notifyUI: async () => {},
        emit: async (eventName) => {
          assert.strictEqual(eventName, 'exec:stop')
          sawExecStop = true
        }
      }
    }, o, n)

    assert.ok(sawExecStop, 'did not emit exec:stop')
  })

  it('cleans up open orders before ending, after a grace period', async () => {
    const o = new Order()
    const n = new Notification({ text: 'from bitfinex' })

    let sawCancelAllOrders = false
    let whenSawExecStop

    await errorInsufficientBalance({
      state: { args: {} },
      h: {
        debug: () => {},
        notifyUI: async () => {},
        emit: async (eventName, cb) => {
          if (eventName === 'exec:order:cancel:all') {
            assert.ok(Date.now() - whenSawExecStop >= 900, 'did not wait for grace period to end before cancelling')
            sawCancelAllOrders = true
          } else {
            whenSawExecStop = Date.now()
            return cb()
          }
        }
      }
    }, o, n)

    assert.ok(sawCancelAllOrders, 'did not cancel all orders')
  })
})
