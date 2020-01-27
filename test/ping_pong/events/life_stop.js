/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Promise = require('bluebird')
const onLifeStop = require('ping_pong/events/life_stop')

describe('ping_pong:events:life_stop', () => {
  it('submits ping orders on startup', (done) => {
    onLifeStop({
      h: {
        debug: () => {},
        emit: (eName) => {
          return new Promise((resolve) => {
            assert.strictEqual(eName, 'exec:order:cancel:all')
            resolve()
          }).then(done).catch(done)
        }
      },
      state: {
        pingPongTable: [],
        activePongs: []
      }
    })
  })
})
