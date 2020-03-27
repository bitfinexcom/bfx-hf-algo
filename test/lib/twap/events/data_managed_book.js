/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Promise = require('bluebird')
const onDataManagedBook = require('../../../../lib/twap/events/data_managed_book')
const Config = require('../../../../lib/twap/config')

const args = {
  symbol: 'tBTCUSD',
  priceTarget: 1000,
  priceCondition: Config.PRICE_COND.MATCH_SIDE
}

describe('twap:events:data_managed_book', () => {
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
    }, 42, {
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
    }, 42, {
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
        updateState: (instance, state) => {
          return new Promise((resolve) => {
            assert.strictEqual(state.lastBook, 42)
            resolve()
          }).then(done).catch(done)
        }
      }
    }, 42, {
      chanFilter: {
        symbol: 'tBTCUSD'
      }
    })
  })
})
