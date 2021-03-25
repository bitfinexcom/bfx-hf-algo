/* eslint-env mocha */
'use strict'

const assert = require('assert')
const { Order } = require('bfx-api-node-models')
const ordersOrderCancel = require('../../../../lib/accumulate_distribute/events/orders_order_cancel')

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
