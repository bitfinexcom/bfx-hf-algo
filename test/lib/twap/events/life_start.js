/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Promise = require('bluebird')
const onLifeStart = require('../../../../lib/twap/events/life_start')
const Config = require('../../../../lib/twap/config')

describe('twap:events:life_start', () => {
  it('emits self interval event', (done) => {
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
        emitSelf: (eName) => {
          return new Promise((resolve) => {
            assert.strictEqual(eName, 'interval_tick')
            resolve()
          }).then(done).catch(done)
        }
      }
    })
  })
})
