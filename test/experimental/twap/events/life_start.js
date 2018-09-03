/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Promise = require('bluebird')
const onLifeStart = require('experimental/twap/events/life_start')
const Config = require('experimental/twap/config')

describe('twap:events:life_start', () => {
  it('sets up interval & saves it on state', (done) => {
    let interval = null

    onLifeStart({
      state: {
        args: {
          sliceInterval: 0,
          priceTarget: 1000,
          priceCondition: Config.PRICE_COND.MATCH_SIDE
        }
      },

      h: {
        debug: () => {},

        updateState: (instance, state) => {
          return new Promise((resolve) => {
            assert(state.interval)
            interval = state.interval
            resolve()
          }).catch(done)
        },

        emitSelf: (eName) => {
          return new Promise((resolve) => {
            assert.equal(eName, 'interval_tick')
            assert(interval)
            clearInterval(interval)
            resolve()
          }).then(done).catch(done)
        }
      }
    })
  })
})
