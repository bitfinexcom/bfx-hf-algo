/* eslint-env mocha */
'use strict'

const assert = require('assert')
const ordersOrderFill = require('../../../../lib/bracket/events/orders_order_fill')

const getInstance = ({
  params = {}, argParams = {}, stateParams = {}, helperParams = {}
}) => ({
  state: {
    initialOrderFilled: false,
    ...stateParams
  },

  h: {
    tracer: { collect: () => ({ meta: {} }) },
    updateState: async () => {},
    emitSelf: async () => {},
    ...helperParams
  },

  ...params
})

describe('bracket:events:orders_order_fill', () => {
  it('sets initial-order-filled flag and submits order', (done) => {
    const i = getInstance({
      helperParams: {
        updateState: async (_, packet) => {
          assert.deepStrictEqual(packet, {
            initialOrderFilled: true
          })
        },

        emitSelf: async (eventName) => {
          assert.strictEqual(eventName, 'submit_oco_order')
          done()
        }
      }
    })

    ordersOrderFill(i, {})
  })

  it('stops if initial order was filled', (done) => {
    const i = getInstance({
      stateParams: { initialOrderFilled: true },
      helperParams: {
        emitSelf: async (eventName) => {
          if (eventName === 'submit_oco_order') {
            assert.ok(false, 'should not have submitted')
          } else if (eventName === 'exec:stop') {
            done()
          }
        }
      }
    })

    ordersOrderFill(i, {})
  })
})
