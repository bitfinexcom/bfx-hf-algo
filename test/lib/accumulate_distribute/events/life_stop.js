/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Promise = require('bluebird')
const lifeStop = require('../../../../lib/accumulate_distribute/events/life_stop')

const getInstance = ({
  params = {}, argParams = {}, stateParams = {}, helperParams = {}
}) => ({
  state: {
    timeout: null,
    ...stateParams
  },
  h: helperParams,
  args: argParams,
  ...params
})

describe('accumulate_distribute:events:life_stop', () => {
  it('clears tick timeout', async () => {
    const i = getInstance({
      stateParams: {
        timeout: setTimeout(() => {
          assert.ok(false, 'timeout should have been cleared')
        }, 50)
      },
      helperParams: {
        updateState: () => {},
        debug: () => {},
        emit: () => {}
      }
    })

    await lifeStop(i)
    return Promise.delay(55)
  })

  it('cancels all order set by the accumulate/distribute algo', async () => {
    let cancelledOrders = false

    const i = getInstance({
      helperParams: {
        updateState: () => {},
        debug: () => {},
        emit: (eventName) => {
          if (eventName === 'exec:order:cancel:gid') {
            cancelledOrders = true
          }
        }
      }
    })

    await lifeStop(i)

    assert.ok(cancelledOrders, 'did not cancel all orders set by accumulate/distribute algo')
  })
})
