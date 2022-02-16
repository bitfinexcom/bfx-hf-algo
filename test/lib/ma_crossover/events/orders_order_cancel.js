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
    tracer: { createSignal: () => ({ meta: {} }) },
    debug: () => {},
    emit: async () => {},
    ...helperParams
  },

  ...params
})

describe('ma_crossover:events:orders_order_cancel', () => {
  it('emits exec:stop', async () => {
    let sawExecStop = false
    const i = getInstance({
      helperParams: {
        emit: async (eventName) => {
          if (eventName === 'exec:stop') {
            sawExecStop = true
          }
        }
      }
    })

    await ordersOrderCancel(i, {})
    assert.ok(sawExecStop, 'did not see exec:stop event')
  })
})
