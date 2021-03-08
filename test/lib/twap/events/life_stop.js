/* eslint-env mocha */
'use strict'

const onLifeStop = require('../../../../lib/twap/events/life_stop')

describe('twap:events:life_stop', () => {
  it('sets up timeout & saves it on state', (done) => {
    const timeout = setTimeout(() => {
      done(new Error('timeout should not have been set'))
    }, 10)

    onLifeStop({
      state: { timeout },
      h: {
        updateState: () => {},
        debug: () => {},
        emit: () => {}
      }
    })

    setTimeout(done, 50)
  })
})
