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
    debug: () => {},
    updateState: async () => {},
    ...helperParams
  },

  ...params
})

describe('ma_crossover:events:life_start', () => {
  it('updates state with long and short indicator instances', (done) => {
    const i = getInstance({
      helperParams: {
        updateState: async (_, update) => {
          assert.ok(update.longIndicator instanceof EMA)
          assert.ok(update.shortIndicator instanceof EMA)
          done()
        }
      }
    })

    lifeStart(i)
  })
})
