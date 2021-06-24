/* eslint-env mocha */
'use strict'

const assert = require('assert')
const { EMA } = require('bfx-hf-indicators')
const lifeStart = require('../../../../lib/accumulate_distribute/events/life_start')
const timeout = require('../../../util/timeout')

const getInstance = ({
  params = {}, argParams = {}, stateParams = {}, helperParams = {}
}) => ({
  state: {
    args: {
      relativeOffset: { type: 'ema', args: [10] },
      relativeCap: { type: 'ema', args: [10] },
      ...argParams
    },
    ...stateParams
  },

  h: {
    timeout,
    debug: () => {},
    emit: async () => {},
    emitSelf: async () => {},
    updateState: async () => {},
    scheduleTick: async () => {},
    notifyUI: async () => {},
    sendPing: async () => { return { ts: Date.now() } },
    subscribeDataChannels: () => Promise.resolve(),
    ...helperParams
  },

  ...params
})

describe('accumulate_distribute:events:life_start', () => {
  it('initializes the offset indicator if needed', async () => {
    let sawInit = false
    const i = getInstance({
      argParams: { relativeCap: {} },
      helperParams: {
        updateState: async (instance, { timeout, offsetIndicator }) => {
          if (timeout) { // catch tick, too lazy to stub
            clearTimeout(timeout)
          } else {
            assert.ok(offsetIndicator instanceof EMA)
            assert.deepStrictEqual(offsetIndicator.serialize().args, [10], 'args not as set')
            sawInit = true
          }
        }
      }
    })

    await lifeStart(i)
    assert.ok(sawInit, 'did not see init')
  })

  it('initializes the cap indicator if needed', async () => {
    let sawInit = false
    const i = getInstance({
      argParams: { relativeOffset: {} },
      helperParams: {
        updateState: async (instance, { timeout, capIndicator }) => {
          if (timeout) { // catch tick, too lazy to stub
            clearTimeout(timeout)
          } else {
            assert.ok(capIndicator instanceof EMA)
            assert.deepStrictEqual(capIndicator.serialize().args, [10], 'args not as set')
            sawInit = true
          }
        }
      }
    })

    await lifeStart(i)
    assert.ok(sawInit, 'did not see init')
  })

  it('schedules the next tick', async () => {
    let tickScheduled = false
    const i = getInstance({
      argParams: { relativeOffset: {} },
      helperParams: {
        updateState: async (instance, { timeout, capIndicator }) => {
          if (timeout) { // catch tick, too lazy to stub
            tickScheduled = true
            clearTimeout(timeout)
          }
        }
      }
    })

    await lifeStart(i)
    assert.ok(tickScheduled, 'did not schedule tick')
  })
})
