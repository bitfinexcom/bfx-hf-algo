/* eslint-env mocha */
'use strict'

const assert = require('assert')
const { Order } = require('bfx-api-node-models')
const cancelAllOrders = require('../../../../lib/host/events/cancel_all_orders')

describe('host:events:cancel_all_orders', () => {
  const getInstance = ({ stateParams = {}, helperParams = {} }) => ({
    state: {
      channels: [],
      orders: [],
      cancelledOrders: [],
      ...stateParams
    },

    h: {
      debug: () => {},
      cancelOrderWithDelay: async (state, delay, o) => {},
      ...helperParams
    }
  })

  it('calls cancelOrderWithDelay with each order', async () => {
    const oA = new Order({ id: 42 })
    const oB = new Order({ id: 41 })
    const i = getInstance({
      stateParams: { orders: [oA, oB] },
      helperParams: {
        cancelOrderWithDelay: async (state, delay, o) => {
          assert.strictEqual(delay, 100)
          if (o === oA) return { ...state, cancelledA: true }
          if (o === oB) return { ...state, cancelledB: true }
          assert.ok(false, 'received unrecognized order')
        }
      }
    })

    await cancelAllOrders({
      emit: async () => {},
      instances: { a: i }
    }, 'a', [oA, oB], 100)

    assert.ok(i.state.cancelledA)
    assert.ok(i.state.cancelledB)
  })

  it('skips market orders', async () => {
    const oA = new Order({ id: 42, type: 'LIMIT' })
    const oB = new Order({ id: 41, type: 'MARKET' })
    const i = getInstance({
      stateParams: { orders: [oA, oB] },
      helperParams: {
        cancelOrderWithDelay: async (state, delay, o) => {
          assert.strictEqual(delay, 100)
          if (o === oA) return { ...state, cancelledA: true }
          if (o === oB) assert.ok(false, 'should not have cancelled order B')
          assert.ok(false, 'received unrecognized order')
        }
      }
    })

    await cancelAllOrders({
      emit: async () => {},
      instances: { a: i }
    }, 'a', [oA, oB], 100)

    assert.ok(i.state.cancelledA)
  })
})
