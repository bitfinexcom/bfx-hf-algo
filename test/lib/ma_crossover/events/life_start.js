/* eslint-env mocha */
'use strict'

const assert = require('assert')
const { EMA } = require('bfx-hf-indicators')
const lifeStart = require('../../../../lib/ma_crossover/events/life_start')

const getInstance = ({
  params = {}, argParams = {}, stateParams = {}, helperParams = {}
}) => ({
  state: {
    args: {
      long: { type: 'ema', args: [100] },
      short: { type: 'ema', args: [20] },
      ...argParams
    },
    ...stateParams
  },

  h: {
    tracer: { createSignal: () => ({ meta: {} }) },
    debug: () => {},
    updateState: async () => {},
    subscribeDataChannels: async () => {},
    sendPing: async () => { return { ts: Date.now() } },
    ...helperParams
  },

  ...params
})

describe('ma_crossover:events:life_start', () => {
  it('updates state with long and short indicator instances', async () => {
    const i = getInstance({
      helperParams: {
        updateState: async (_, update) => {
          assert.ok(update.longIndicator instanceof EMA)
          assert.ok(update.shortIndicator instanceof EMA)
        }
      }
    })

    await lifeStart(i)
  })
})
