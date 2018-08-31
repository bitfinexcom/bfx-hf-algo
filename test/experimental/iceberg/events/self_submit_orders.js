/* eslint-env mocha */
'use strict'

const Promise = require('bluebird')
const assert = require('assert')
const onSubmitOrders = require('experimental/iceberg/events/self_submit_orders')

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
        emit: (eName, gid, orders, submitDelay) => {
          return new Promise((resolve) => {
            assert.equal(eName, 'exec:order:submit:all')
            assert.equal(gid, 41)
            assert.equal(submitDelay, 42)
            assert.equal(orders.length, 1)

            const [order] = orders
            assert.equal(order.symbol, 'tBTCUSD')
            assert.equal(order.type, 'EXCHANGE MARKET')
            assert.equal(order.price, 1000)
            assert.equal(order.amount, 0.05)

            resolve()
          }).then(done).catch(done)
        }
      }
    })
  })
})
