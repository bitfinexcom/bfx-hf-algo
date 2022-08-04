/* eslint-env mocha */
'use strict'

const assert = require('assert')
const onLifeStart = require('../../../../lib/bracket/events/life_start')

const getInstance = ({
  params = {}, argParams = {}, stateParams = {}, helperParams = {}
}) => ({
  state: {
    initialOrderFilled: false,
    ...stateParams
  },

  h: {
    tracer: { collect: () => ({}) },
    updateState: async () => {},
    emitSelf: async () => {},
    ...helperParams
  },

  ...params
})

describe('bracket:events:life_start', () => {
  it('submits initial order if intial order isn\'t filled', async () => {
    const i = getInstance({
      helperParams: {
        emitSelf: async (eventName) => {
          if (eventName === 'submit_oco_order') {
            assert.ok(false, 'should not have submitted oco order')
          }
        }
      }
    })

    await onLifeStart(i)
  })

  it('submits oco order if intial order is filled', async () => {
    const i = getInstance({
      stateParams: { initialOrderFilled: true },
      helperParams: {
        emitSelf: async (eventName) => {
          if (eventName === 'submit_initial_order') {
            assert.ok(false, 'should not have submitted initial order')
          }
        }
      }
    })

    await onLifeStart(i)
  })
})
