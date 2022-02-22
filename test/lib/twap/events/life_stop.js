/* eslint-env mocha */
'use strict'

const assert = require('assert')
const onLifeStop = require('../../../../lib/ping_pong/events/life_stop')

describe('twap:events:life_stop', () => {
  it('cancels all orders when twap algo stopped', async () => {
    let cancelledOrders = false

    await onLifeStop({
      h: {
        tracer: { collect: () => {} },
        updateState: () => {},
        debug: () => {},
        emit: (eventName) => {
          if (eventName === 'exec:order:cancel:all') {
            cancelledOrders = true
          }
        }
      }
    })

    assert.ok(cancelledOrders, 'did not cancel all orders set by twap algo')
  })
})
