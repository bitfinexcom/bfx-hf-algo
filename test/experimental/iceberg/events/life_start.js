/* eslint-env mocha */
'use strict'

const Promise = require('bluebird')
const assert = require('assert')
const onLifeStart = require('experimental/iceberg/events/life_start')

describe('iceberg:events:life_start', () => {
  it('submits orders on startup', (done) => {
    onLifeStart({ h: {
      emitSelf: (eName) => {
        return new Promise((resolve) => {
          assert.equal(eName, 'submit_orders')
          resolve()
        }).then(done).catch(done)
      }
    }})
  })
})
