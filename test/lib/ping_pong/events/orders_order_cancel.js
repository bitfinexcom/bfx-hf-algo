/* eslint-env mocha */
'use strict'

const assert = require('assert')
const onOrdersCancel = require('../../../../lib/ping_pong/events/orders_order_cancel')

describe('ping_pong:events:life_stop', () => {
  const order = {
    id: 123,
    cid: 456,
    gid: 789
  }

  it('emits exec:stop', async () => {
    let sawExecStop = false

    await onOrdersCancel({
      h: {
        updateState: () => {},
        debug: () => {},
        tracer: { collect: () => {} },
        emit: (eventName) => {
          if (eventName === 'exec:stop') {
            sawExecStop = true
          }
        }
      }
    }, order)

    assert.ok(sawExecStop, 'did not see exec:stop event')
  })
})
