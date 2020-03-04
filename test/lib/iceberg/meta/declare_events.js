/* eslint-env mocha */
'use strict'

const assert = require('assert')
const declareEvents = require('../../../../lib/iceberg/meta/declare_events')

describe('iceberg:meta:declare_events', () => {
  it('declares submit_orders event', (done) => {
    declareEvents({
      h: {
        declareEvent: (_, host, handlerPath, eventName) => {
          assert.strictEqual(host, 42)
          assert.strictEqual(handlerPath, 'self:submit_orders')
          assert.strictEqual(eventName, 'submit_orders')
          done()
        }
      }
    }, 42)
  })
})
