/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isObject = require('lodash/isObject')
const { OrderBook } = require('bfx-api-node-models')
const dataManagedBook = require('../../../../lib/accumulate_distribute/events/data_managed_book')

const getInstance = ({
  params = {}, argParams = {}, stateParams = {}, helperParams = {}
}) => ({
  state: {
    args: {
      relativeOffset: {},
      relativeCap: {},
      ...argParams
    },
    ...stateParams
  },

  h: {
    emit: () => {},
    debug: () => {},
    updateState: async () => {},
    ...helperParams
  },

  ...params
})

describe('accumulate_distribute:events:data_managed_book', () => {
  const book = new OrderBook()

  it('does nothing if the order has no OB requirement', async () => {
    const i = getInstance({
      argParams: { symbol: 'tBTCUSD' },
      helperParams: {
        updateState: async () => assert.ok(false, 'should not have updated state')
      }
    })

    return dataManagedBook(i, book, { chanFilter: { symbol: 'tBTCUSD' } })
  })

  it('does nothing if receiving data for a different book channel', () => {
    const i = getInstance({
      argParams: {
        symbol: 'tLEOUSD',
        relativeOffset: { type: 'bid' }
      },

      helperParams: {
        updateState: async () => assert.ok(false, 'should not have updated state')
      }
    })

    return dataManagedBook(i, book, { chanFilter: { symbol: 'tBTCUSD' } })
  })

  it('updates the last received book on the state', async () => {
    let seenUpdate = false
    const i = getInstance({
      argParams: {
        symbol: 'tBTCUSD',
        relativeOffset: { type: 'bid' }
      },

      helperParams: {
        updateState: async (instance, packet) => {
          assert.strictEqual(instance, i, 'did not update state with correct instance')
          assert.ok(_isObject(packet), 'state packet not an object')
          assert.strictEqual(packet.lastBook, book, 'did not received correct OB')
          seenUpdate = true
        }
      }
    })

    await dataManagedBook(i, book, { chanFilter: { symbol: 'tBTCUSD' } })
    assert.ok(seenUpdate, 'did not see update')
  })
})
