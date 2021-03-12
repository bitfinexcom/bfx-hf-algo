/* eslint-env mocha */
'use strict'

const assert = require('assert')
const onOrdersCancel = require('../../../../lib/ping_pong/events/orders_order_cancel')

describe('ping_pong:events:life_stop', () => {
  it('emits exec:stop', async () => {
    let sawExecStop = false

    await onOrdersCancel({
      h: {
        updateState: () => {},
        debug: () => {},
        emit: (eventName) => {
          if (eventName === 'exec:stop') {
            sawExecStop = true
          }
        }
      }
    })

    assert.ok(sawExecStop, 'did not see exec:stop event')
  })
})
