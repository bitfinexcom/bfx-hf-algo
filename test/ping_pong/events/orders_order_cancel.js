/* eslint-env mocha */
'use strict'

const Promise = require('bluebird')
const onOrdersCancel = require('ping_pong/events/orders_order_cancel')

describe('ping_pong:events:orders_order_cancel', () => {
  it('detects atomic cancelations and stops', (done) => {
    let cancelAllCalled = false
    onOrdersCancel({
      h: {
        debug: () => {},
        emit: (eName) => {
          return new Promise((resolve) => {
            if (eName === 'exec:order:cancel:all') {
              cancelAllCalled = true
            }
            if (eName === 'exec:stop' && cancelAllCalled) {
              done()
            }
            resolve()
          }).catch(done)
        }
      },
      state: {
        pingPongTable: [],
        activePongs: []
      }
    })
  })
})
