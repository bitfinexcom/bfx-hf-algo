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
  ...params
})

describe('accumulate_distribute:events:life_stop', () => {
  it('clears tick timeout', async () => {
    const i = getInstance({
      stateParams: {
        timeout: setTimeout(() => {
          assert.ok(false, 'timeout should have been cleared')
        }, 50)
      }
    })

    await lifeStop(i)
    return Promise.delay(55)
  })
})
