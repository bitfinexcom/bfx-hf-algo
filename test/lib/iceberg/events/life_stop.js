/* eslint-env mocha */
'use strict'

const assert = require('assert')
const onLifeStop = require('../../../../lib/iceberg/events/life_stop')

describe('iceberg:events:life_stop', () => {
  it('cancels the debounce set to manage orders when received simultaneously', async () => {
    let debounceCancelled = false
    await onLifeStop({
      h: {
        updateState: () => {},
        debug: () => {},
        emit: () => {},
        debouncedSubmitOrders: {
          cancel: () => {
            debounceCancelled = true
          }
        }
      }
    })
    assert.ok(debounceCancelled, 'did not cancel the debounce method set on startup')
  })

  it('cancels all orders when iceberg algo stopped', async () => {
    let cancelledOrders = false

    await onLifeStop({
      h: {
        updateState: () => {},
        debug: () => {},
        debouncedSubmitOrders: {
          cancel: () => {}
        },
        emit: (eventName) => {
          if (eventName === 'exec:order:cancel:all') {
            cancelledOrders = true
          }
        }
      }
    })

    assert.ok(cancelledOrders, 'did not cancel all orders set by iceberg algo')
  })
})
