/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Promise = require('bluebird')
const onLifeStart = require('../../../../lib/twap/events/life_start')
const Config = require('../../../../lib/twap/config')

describe('twap:events:life_start', () => {
  it('sets up interval & saves it on state', (done) => {
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
        subscribeDataChannels: async () => {},
        updateState: (instance, state) => {
          assert.deepStrictEqual(Object.keys(state), ['minDistortedAmount', 'maxDistortedAmount'])
        },
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
