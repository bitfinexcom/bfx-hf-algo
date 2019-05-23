/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Promise = require('bluebird')
const onDataTrades = require('twap/events/data_trades')
const Config = require('twap/config')

const args = {
  symbol: 'tBTCUSD',
  priceTarget: 1000,
  priceCondition: Config.PRICE_COND.MATCH_LAST
}

describe('twap:events:data_trades', () => {
  it('does nothing if price target/condition do not rely trades', (done) => {
    onDataTrades({
      state: {
        args: {
          ...args,
          priceCondition: Config.PRICE_COND.MATCH_SIDE // note book match
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
    }, [42], {
      chanFilter: {
        symbol: 'tBTCUSD'
      }
    })

    done()
  })

  it('does nothing if update is for a different symbol', (done) => {
    onDataTrades({
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
    }, [42], {
      chanFilter: {
        symbol: 'tETHUSD'
      }
    })

    done()
  })

  it('updates state with provided trade if matched', (done) => {
    onDataTrades({
      state: {
        args
      },

      h: {
        debug: () => {},
        updateState: (instance, state) => {
          return new Promise((resolve) => {
            assert.strictEqual(state.lastTrade, 42)
            resolve()
          }).then(done).catch(done)
        }
      }
    }, [42], {
      chanFilter: {
        symbol: 'tBTCUSD'
      }
    })
  })
})
