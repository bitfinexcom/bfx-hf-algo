/* eslint-env mocha */
'use strict'

const onLifeStop = require('experimental/twap/events/life_stop')

describe('twap:events:life_stop', () => {
  it('sets up interval & saves it on state', (done) => {
    const interval = setInterval(() => {
      done(new Error('interval should not have been set'))
    }, 10)

    onLifeStop({
      state: { interval }
    })

    setTimeout(done, 50)
  })
})
