/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Promise = require('bluebird')
const onLifeStart = require('ping_pong/events/life_start')

describe('ping_pong:events:life_start', () => {
  it('submits ping orders on startup', (done) => {
    onLifeStart({
      h: {
        debug: () => {},
        emit: (eName) => {
          return new Promise((resolve) => {
            assert.strictEqual(eName, 'exec:order:submit:all')
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
  it('submits pong orders on startup', (done) => {
    onLifeStart({
      h: {
        debug: () => {},
        emit: (eName, gid, orders) => {
          return new Promise((resolve) => {
            assert.strictEqual(eName, 'exec:order:submit:all')
            if (orders[0] && orders[0].price === '928') {
              done()
            }
            resolve()
          }).catch(done)
        }
      },
      state: {
        pingPongTable: [],
        activePongs: {
          '928': {}
        }
      }
    })
  })
})
