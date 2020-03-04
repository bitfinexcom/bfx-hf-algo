/* eslint-env mocha */
'use strict'

const assert = require('assert')
const { PublicTrade } = require('bfx-api-node-models')
const dataTrades = require('../../../../lib/accumulate_distribute/events/data_trades')

const getInstance = ({
  params = {}, argParams = {}, stateParams = {}, helperParams = {}
}) => ({
  state: {
    args: {
      relativeOffset: { type: 'trade' },
      relativeCap: { type: 'trade' },
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

describe('accumulate_distribute:events:data_trades', () => {
  it('does nothing if the AO has no trade requirement', async () => {
    const i = getInstance({
      argParams: {
        symbol: 'tBTCUSD',
        relativeOffset: {},
        relativeCap: {}
      },

      helperParams: {
        updateState: async () => assert.ok(false, 'state should not have been updated ')
      }
    })

    return dataTrades(i, [], { chanFilter: { symbol: 'tBTCUSD' } })
  })

  it('does nothing if receiving a trade for a different symbol', () => {
    const i = getInstance({
      argParams: { symbol: 'tLEOUSD' },
      helperParams: {
        updateState: async () => assert.ok(false, 'state should not have been updated ')
      }
    })

    return dataTrades(i, [], { chanFilter: { symbol: 'tBTCUSD' } })
  })

  it('updates state if the AO has a trade relative offset', async () => {
    let stateUpdated = false
    const t = new PublicTrade({ price: 42, amount: 9001 })
    const i = getInstance({
      argParams: {
        symbol: 'tBTCUSD',
        relativeOffset: { type: 'trade' },
        relativeCap: {}
      },

      helperParams: {
        updateState: async (instance, { lastTrade }) => {
          assert.strictEqual(instance, i, 'received wrong instance')
          assert.strictEqual(lastTrade, t, 'received wrong trade')
          stateUpdated = true
        }
      }
    })

    await dataTrades(i, [t], { chanFilter: { symbol: 'tBTCUSD' } })
    assert.ok(stateUpdated, 'state should have been updated')
  })

  it('updates state if the AO has a trade relative cap', async () => {
    let stateUpdated = false
    const t = new PublicTrade({ price: 42, amount: 9001 })
    const i = getInstance({
      argParams: {
        symbol: 'tBTCUSD',
        relativeOffset: {},
        relativeCap: { type: 'trade' }
      },

      helperParams: {
        updateState: async (instance, { lastTrade }) => {
          assert.strictEqual(instance, i, 'received wrong instance')
          assert.strictEqual(lastTrade, t, 'received wrong trade')
          stateUpdated = true
        }
      }
    })

    await dataTrades(i, [t], { chanFilter: { symbol: 'tBTCUSD' } })
    assert.ok(stateUpdated, 'state should have been updated')
  })
})
