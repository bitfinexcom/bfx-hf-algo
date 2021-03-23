/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Promise = require('bluebird')
const { Order } = require('bfx-api-node-models')
const ordersOrderCancel = require('../../../../lib/accumulate_distribute/events/orders_order_cancel')

const o = new Order()
const getInstance = ({
  params = {}, argParams = {}, stateParams = {}, helperParams = {}
}) => ({
  state: {
    timeout: null,
    args: argParams,
    ...stateParams
  },

  h: {
    emit: async () => {},
    debug: () => {},
    ...helperParams
  },
  ...params
})

describe('accumulate_distribute:events:orders_order_cancel', () => {
  it('clears the timeout if set', async () => {
    const i = getInstance({
      stateParams: {
        timeout: setTimeout(() => {
          assert.ok(false, 'timeout should have been cleared')
        }, 50)
      }
    })

    await ordersOrderCancel(i, o)
    return Promise.delay(55)
  })

  it('cancels all orders', async () => {
    let sawCancelAll = false
    const orders = [new Order(), new Order()]
    const i = getInstance({
      stateParams: {
        orders,
        gid: 42
      },

      helperParams: {
        emit: async (eventName, gid, receivedOrders) => {
          if (eventName !== 'exec:order:cancel:all') {
            return
          }

          assert.strictEqual(gid, 42, 'received wrong gid')
          assert.strictEqual(receivedOrders, orders, 'received wrong orders')
          sawCancelAll = true
        }
      }
    })

    await ordersOrderCancel(i, orders[0])
    assert.ok(sawCancelAll, 'did not see cancel-all event')
  })

  it('emits the exec:stop event', async () => {
    let sawExecStop = false
    const orders = [new Order(), new Order()]
    const i = getInstance({
      stateParams: {
        orders,
        gid: 42
      },

      helperParams: {
        emit: async (eventName) => {
          if (eventName !== 'exec:stop') {
            return
          }
          sawExecStop = true
        }
      }
    })

    await ordersOrderCancel(i, orders[0])
    assert.ok(sawExecStop, 'did not see exec:stop event')
  })
})
