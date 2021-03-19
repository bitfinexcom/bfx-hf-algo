/* eslint-env mocha */
'use strict'

const Promise = require('bluebird')
const assert = require('assert')
const onSubmitOrders = require('../../../../lib/iceberg/events/self_submit_orders')

describe('iceberg:events:self_submit_orders', () => {
  it('submits generated orders', (done) => {
    onSubmitOrders({
      state: {
        gid: 41,
        remainingAmount: 0.05,
        args: {
          submitDelay: 42,
          excessAsHidden: false,
          sliceAmount: 0.1,
          amount: 1,
          price: 1000,
          orderType: 'EXCHANGE MARKET',
          symbol: 'tBTCUSD'
        }
      },

      h: {
        timeout: () => {
          return [null, () => {}]
        },
        updateState: () => {},
        emit: (eName, gid, orders, submitDelay) => {
          return new Promise((resolve) => {
            assert.strictEqual(eName, 'exec:order:submit:all')
            assert.strictEqual(gid, 41)
            assert.strictEqual(submitDelay, 0)
            assert.strictEqual(orders.length, 1)

            const [order] = orders
            assert.strictEqual(order.symbol, 'tBTCUSD')
            assert.strictEqual(order.type, 'EXCHANGE MARKET')
            assert.strictEqual(order.price, 1000)
            assert.strictEqual(order.amount, 0.05)

            resolve()
          }).then(done).catch(done)
        }
      }
    })
  })
})
