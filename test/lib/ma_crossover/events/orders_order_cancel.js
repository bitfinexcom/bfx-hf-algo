/* eslint-env mocha */
'use strict'

const assert = require('assert')
const ordersOrderCancel = require('../../../../lib/ma_crossover/events/orders_order_cancel')

const getInstance = ({
  params = {}, argParams = {}, stateParams = {}, helperParams = {}
}) => ({
  state: {
    gid: 42,
    orders: {},
    args: argParams,
    ...stateParams
  },

  h: {
    debug: () => {},
    emit: async () => {},
    ...helperParams
  },

  ...params
})

describe('ma_crossover:events:orders_order_cancel', () => {
  it('cancels all orders', (done) => {
    const i = getInstance({
      helperParams: {
        emit: async (eventName, gid, orders) => {
          if (eventName !== 'exec:order:cancel:all') return

          assert.strictEqual(gid, 42)
          assert.deepStrictEqual(orders, {})
          done()
        }
      }
    })

    ordersOrderCancel(i, {})
  })

  it('emits exec:stop', (done) => {
    const i = getInstance({
      helperParams: {
        emit: async (eventName) => {
          if (eventName === 'exec:stop') {
            done()
          }
        }
      }
    })

    ordersOrderCancel(i, {})
  })
})
