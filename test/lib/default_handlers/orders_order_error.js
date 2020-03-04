/* eslint-env mocha */
'use strict'

const assert = require('assert')
const { Order, Notification } = require('bfx-api-node-models')
const ordersOrderError = require('../../../lib/default_handlers/orders_order_error')

describe('default error:minimum-size handler', () => {
  it('emits the exec:stop event', async () => {
    const o = new Order()
    const n = new Notification({ text: 'from bitfinex' })

    let sawExecStop = false

    await ordersOrderError({
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

    await ordersOrderError({
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
