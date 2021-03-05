/* eslint-env mocha */
'use strict'

const assert = require('assert')
const onLifeStop = require('../../../../lib/twap/events/life_stop')

describe('twap:events:life_stop', () => {
  it('clears timeout if exists and updates state', (done) => {
    const timeout = setTimeout(() => {
      done(new Error('timeout should not have been set'))
    }, 10)

    onLifeStop({
      state: { timeout },
      h: {
        updateState: (_, state) => {
          return new Promise((resolve) => {
            assert.deepStrictEqual(state.timeout, null)
            resolve()
          })
        },
        debug: () => {}
      }
    })

    setTimeout(done, 50)
  })
})
