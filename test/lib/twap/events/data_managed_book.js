/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Promise = require('bluebird')
const { OrderBook } = require('bfx-api-node-models')
const onDataManagedBook = require('../../../../lib/twap/events/data_managed_book')
const Config = require('../../../../lib/twap/config')

const args = {
  symbol: 'tBTCUSD',
  priceTarget: 1000,
  priceCondition: Config.PRICE_COND.MATCH_SIDE
}

describe('twap:events:data_managed_book', () => {
  const serializedData = [
    [86952874847, 44034, -2],
    [86952827542, 44037, -2],
    [86952874851, 44042, -2],
    [86951688951, 44052, -2],
  ]

  it('does nothing if price target/condition do not rely on book', (done) => {
    onDataManagedBook({
      state: {
        args: {
          ...args,
          priceCondition: Config.PRICE_COND.MATCH_LAST // note trade match
        }
      },

      h: {
        debug: () => {},
        updateState: (instance, state) => {
          return new Promise((resolve, reject) => {
            reject(new Error('state should not have been updated'))
          }).then(done).catch(done)
        }
      }
    }, {
      serialize: () => { return serializedData }
    }, {
      chanFilter: {
        symbol: 'tBTCUSD'
      }
    })

    done()
  })

  it('does nothing if update is for a different book', (done) => {
    onDataManagedBook({
      state: {
        args
      },

      h: {
        debug: () => {},
        updateState: (instance, state) => {
          return new Promise((resolve, reject) => {
            reject(new Error('state should not have been updated'))
          }).then(done).catch(done)
        }
      }
    }, {
      serialize: () => { return serializedData }
    }, {
      chanFilter: {
        symbol: 'tETHUSD'
      }
    })

    done()
  })

  it('updates state with provided order book if matched', (done) => {
    onDataManagedBook({
      state: {
        args
      },

      h: {
        debug: () => {},
        tracer: { createSignal: () => {} },
        updateState: (instance, state) => {
          return new Promise((resolve) => {
            assert.ok(state.lastBook instanceof OrderBook)
            resolve()
          }).then(done).catch(done)
        }
      }
    }, {
      serialize: () => { return serializedData }
    }, {
      chanFilter: {
        symbol: 'tBTCUSD'
      }
    })
  })
})
