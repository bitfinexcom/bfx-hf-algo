/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Promise = require('bluebird')
const _isObject = require('lodash/isObject')
const { Order } = require('bfx-api-node-models')
const ordersOrderFill = require('../../../../lib/accumulate_distribute/events/orders_order_fill')

const timeout = (ms) => {
  let id = null

  const p = new Promise((resolve) => {
    id = { ms }
    resolve()
  })

  return [id, () => p]
}

const getInstance = ({
  params = {}, argParams = {}, stateParams = {}, helperParams = {}
}) => ({
  state: {
    timeout: null,
    currentOrder: null,
    ordersBehind: 0,
    args: {
      catchUp: false,
      ...argParams
    },
    ...stateParams
  },

  h: {
    timeout,
    emit: async () => {},
    emitSelf: async () => {},
    updateState: async () => {},
    notifyUI: async () => {},
    debug: () => {},
    ...helperParams
  },

  ...params
})

describe('accumulate_distribute:events:orders_order_fill', () => {
  it('resets the last fill amount on the order', async () => {
    const o = new Order({ amount: 42 })
    o.amount = 40
    assert.strictEqual(o.getLastFillAmount(), 2, 'sanity check failed')

    const i = getInstance({})
    await ordersOrderFill(i, o)
    assert.strictEqual(o.getLastFillAmount(), 0, 'order fill amount not reset')
  })

  it('updates state with the new remaining amount & timeline position', async () => {
    const o = new Order({ amount: 42 })
    o.amount = 40
    assert.strictEqual(o.getLastFillAmount(), 2, 'sanity check failed')

    let sawStateUpdate = false
    const i = getInstance({
      stateParams: {
        remainingAmount: 20,
        ordersBehind: 2,
        currentOrder: 4
      },

      helperParams: {
        updateState: async (instance, packet) => {
          assert.strictEqual(instance, i, 'received unexpected instance')
          assert.ok(_isObject(packet), 'did not receive state update object')
          assert.strictEqual(packet.remainingAmount, 18, 'incorrect remaining amount')
          assert.strictEqual(packet.ordersBehind, 1, 'incorrect orders-behind count')
          assert.strictEqual(packet.currentOrder, 5, 'incorrect current order index')
          sawStateUpdate = true
        }
      }
    })

    await ordersOrderFill(i, o)
    assert.ok(sawStateUpdate, 'did not see state update')
  })

  it('clears the tick timeout and emits exec:stop if the order is fully filled', async () => {
    let sawExecStop = false

    const o = new Order({ amount: 42 })
    o.amount = 0
    assert.strictEqual(o.getLastFillAmount(), 42, 'sanity check failed')

    const i = getInstance({
      stateParams: {
        remainingAmount: 42,
        timeout: setTimeout(() => {
          assert.ok(false, 'timeout should have been cleared')
        }, 50)
      },

      helperParams: {
        updateState: async () => {},
        emit: async (eventName) => {
          if (eventName === 'exec:stop') {
            sawExecStop = true
          }
        }
      }
    })

    await ordersOrderFill(i, o)
    assert.ok(sawExecStop, 'did not see exec:stop event')
    return Promise.delay(70) // give timeout a chance to assert false if not cleared
  })

  it('schedules the next tick immediately if not fully filled and catching up + behind', async () => {
    let sawStateUpdate = false
    const o = new Order({ amount: 42 })
    o.amount = 20
    assert.strictEqual(o.getLastFillAmount(), 22, 'sanity check failed')

    const i = getInstance({
      argParams: { catchUp: true },
      stateParams: {
        timeout: null,
        remainingAmount: 100,
        ordersBehind: 4
      },

      helperParams: {
        updateState: async (instance, packet) => {
          sawStateUpdate = true
          assert.strictEqual(instance, i, 'saw unexpected instance')
          Object.assign(i.state, packet)
        }
      }
    })

    await ordersOrderFill(i, o)

    assert.ok(sawStateUpdate, 'did not see state update')
    assert.ok(i.state.timeout !== null, 'no tick was scheduled')
    clearTimeout(i.state.timeout)
  })
})
