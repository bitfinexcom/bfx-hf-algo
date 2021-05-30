/* eslint-env mocha */
'use strict'

const assert = require('assert')
const { tick } = require('../../../../lib/twap/util/schedule_tick')

describe('twap:util:schedule_tick', () => {
  it('schedules interval tick', async () => {
    let selfEmitsIntervalTick = false
    const instance = {
      h: {
        timeout: () => {
          return [null, () => {}]
        },
        debug: () => {},
        updateState: () => {},
        emitSelf: (eventName) => {
          if (eventName === 'interval_tick') {
            selfEmitsIntervalTick = true
          }
        }
      }
    }
    await tick(instance)
    assert.ok(selfEmitsIntervalTick, 'should have self emitted interval tick')
  })
})
