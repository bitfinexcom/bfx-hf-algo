/* eslint-env mocha */
'use strict'

const assert = require('assert')
const onLifeStop = require('../../../../lib/ma_crossover/events/life_stop')

describe('ma_crossover:events:life_stop', () => {
  it('cancels all orders when ma crossover algo stopped', async () => {
    let cancelledOrders = false

    await onLifeStop({
      h: {
        updateState: () => {},
        debug: () => {},
        emit: (eventName) => {
          if (eventName === 'exec:order:cancel:all') {
            cancelledOrders = true
          }
        }
      }
    })

    assert.ok(cancelledOrders, 'did not cancel all orders set by ma crossover algo')
  })
})
