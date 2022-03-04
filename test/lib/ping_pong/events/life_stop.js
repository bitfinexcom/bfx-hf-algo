/* eslint-env mocha */
'use strict'

const assert = require('assert')
const onLifeStop = require('../../../../lib/ping_pong/events/life_stop')

describe('ping_pong:events:life_stop', () => {
  it('cancels all orders when ping pong algo stopped', async () => {
    let cancelledOrders = false

    await onLifeStop({
      h: {
        updateState: () => {},
        debug: () => {},
        tracer: { collect: () => ({}) },
        emit: (eventName) => {
          if (eventName === 'exec:order:cancel:all') {
            cancelledOrders = true
          }
        }
      }
    })

    assert.ok(cancelledOrders, 'did not cancel all orders set by ping pong algo')
  })
})
