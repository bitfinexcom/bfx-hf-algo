/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Promise = require('bluebird')
const onLifeStart = require('iceberg/events/life_start')

describe('iceberg:events:life_start', () => {
  it('submits orders on startup', (done) => {
    onLifeStart({
      h: {
        emitSelf: (eName) => {
          return new Promise((resolve) => {
            assert.strictEqual(eName, 'submit_orders')
            resolve()
          }).then(done).catch(done)
        }
      }
    })
  })
})
