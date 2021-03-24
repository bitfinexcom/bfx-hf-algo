/* eslint-env mocha */
'use strict'

const assert = require('assert')
const onOrderCancel = require('../../../../lib/iceberg/events/orders_order_cancel')

describe('iceberg:events:orders_order_cancel', () => {
  it('submits all known orders for cancellation & stops operation', (done) => {
    onOrderCancel({
      h: {
        debug: () => {},
        emit: async (eName) => {
          assert.strictEqual(eName, 'exec:stop')
          done()
        }
      }
    })
  })
})
