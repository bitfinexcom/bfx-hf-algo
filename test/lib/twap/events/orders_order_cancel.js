/* eslint-env mocha */
'use strict'

const assert = require('assert')
const onOrderCancel = require('../../../../lib/twap/events/orders_order_cancel')

describe('twap:events:orders_order_cancel', () => {
  const instance = {
    h: {
      tracer: { collect: () => {} },
      debug: () => {},
      emit: async (eName) => {
        assert.strictEqual(eName, 'exec:stop')
      }
    }
  }
  const order = {
    id: 87,
    cid: 4934,
    gid: 123
  }

  it('submits all known orders for cancellation & stops operation', async () => {
    await onOrderCancel(instance, order)
  })
})
