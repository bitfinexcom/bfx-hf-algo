/* eslint-env mocha */
'use strict'

const assert = require('assert')
const onOrderCancel = require('../../../lib/twap/events/orders_order_cancel')

describe('twap:events:orders_order_cancel', () => {
  it('submits all known orders for cancellation & stops operation', (done) => {
    let call = 0
    const orderState = {
      1: 'some_order_object'
    }

    onOrderCancel({
      state: {
        gid: 100,
        args: { cancelDelay: 42 },
        orders: orderState
      },

      h: {
        debug: () => {},
        emit: async (eName, gid, orders, cancelDelay) => {
          if (call === 0) {
            assert.strictEqual(gid, 100)
            assert.strictEqual(eName, 'exec:order:cancel:all')
            assert.strictEqual(cancelDelay, 42)
            assert.deepStrictEqual(orders, orderState)
            call += 1
          } else if (call === 1) {
            assert.strictEqual(eName, 'exec:stop')
            done()
          } else {
            done(new Error('too many events emitted'))
          }
        }
      }
    })
  })
})
