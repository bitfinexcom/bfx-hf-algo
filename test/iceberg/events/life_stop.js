/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Promise = require('bluebird')
const onLifeStop = require('../../../lib/iceberg/events/life_stop')

describe('iceberg:events:life_stop', () => {
  it('submits all known orders for cancellation', (done) => {
    const orderState = {
      1: 'some_order_object'
    }

    onLifeStop({
      state: {
        gid: 100,
        args: { cancelDelay: 42 },
        orders: orderState
      },

      h: {
        debouncedSubmitOrders: {
          cancel: () => {}
        },

        emit: (eName, gid, orders, cancelDelay) => {
          return new Promise((resolve) => {
            assert.strictEqual(gid, 100)
            assert.strictEqual(eName, 'exec:order:cancel:all')
            assert.strictEqual(cancelDelay, 42)
            assert.deepStrictEqual(orders, orderState)
            resolve()
          }).then(done).catch(done)
        }
      }
    })
  })
})
